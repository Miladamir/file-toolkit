"use client";

import { useState, useRef, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
// REMOVED: Static import causing the build error
// import * as pdfjsLib from "pdfjs-dist";
import {
    Upload,
    Download,
    FileText,
    Minimize2,
    Sliders,
    RefreshCw,
    Image as ImageIcon
} from "lucide-react";

// Helper to dynamically load PDF.js only on the client
const getPdfJs = async () => {
    const pdfjsLib = await import("pdfjs-dist");
    // Configure Worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    return pdfjsLib;
};

interface CompressionSettings {
    dpi: number;
    quality: number;
}

export default function PdfCompressPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const [settings, setSettings] = useState<CompressionSettings>({
        dpi: 150,
        quality: 0.8
    });

    const [stats, setStats] = useState({
        originalSize: 0,
        compressedSize: 0,
        saved: 0
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- File Handling ---

    const handleFile = async (file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        setFile(file);
        setStats({ originalSize: file.size, compressedSize: 0, saved: 0 });

        // Render Preview
        try {
            // Dynamically load library
            const pdfjsLib = await getPdfJs();

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdfDoc.getPage(1);

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: ctx,
                viewport: viewport,
                canvas: canvas
            }).promise;

        } catch (err) {
            console.error(err);
            toast.error("Failed to read PDF preview.");
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    // --- Compression Logic ---

    const startCompression = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(0);

        try {
            // Dynamically load library
            const pdfjsLib = await getPdfJs();

            const arrayBuffer = await file.arrayBuffer();
            const srcPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = srcPdf.numPages;

            const pdfDoc = await PDFDocument.create();

            const scale = settings.dpi / 72;

            for (let i = 1; i <= numPages; i++) {
                setProgress(Math.round((i / numPages) * 100));

                const page = await srcPdf.getPage(i);
                const viewport = page.getViewport({ scale: scale });

                const tCanvas = document.createElement("canvas");
                const tCtx = tCanvas.getContext("2d");

                if (!tCtx) {
                    console.error("Failed to get 2d context");
                    continue;
                }

                tCanvas.height = viewport.height;
                tCanvas.width = viewport.width;

                await page.render({
                    canvasContext: tCtx,
                    viewport: viewport,
                    canvas: tCanvas
                }).promise;

                const imgDataUrl = tCanvas.toDataURL("image/jpeg", settings.quality);
                const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

                const img = await pdfDoc.embedJpg(imgBytes);
                const newPage = pdfDoc.addPage([tCanvas.width, tCanvas.height]);
                newPage.drawImage(img, {
                    x: 0,
                    y: 0,
                    width: tCanvas.width,
                    height: tCanvas.height
                });
            }

            const pdfBytes = await pdfDoc.save();

            const newSize = pdfBytes.length;
            const saved = file.size - newSize;
            const percent = file.size > 0 ? ((saved / file.size) * 100) : 0;

            setStats({
                originalSize: file.size,
                compressedSize: newSize,
                saved: percent
            });

            const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `compressed_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("PDF Compressed Successfully!");

        } catch (err) {
            console.error(err);
            toast.error("Compression failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><ImageIcon size={12} /> Resolution (DPI)</label>
                    <span className="font-mono text-sm text-[var(--accent)]">{settings.dpi}</span>
                </div>
                <input
                    type="range"
                    min="72" max="300"
                    value={settings.dpi}
                    onChange={(e) => setSettings(p => ({ ...p, dpi: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <p className="text-[10px] text-[var(--fg-secondary)]">Higher DPI = Better Quality, Larger File.</p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><Sliders size={12} /> JPEG Quality</label>
                    <span className="font-mono text-sm text-[var(--accent)]">{settings.quality.toFixed(1)}</span>
                </div>
                <input
                    type="range"
                    min="0.1" max="1.0" step="0.1"
                    value={settings.quality}
                    onChange={(e) => setSettings(p => ({ ...p, quality: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <p className="text-[10px] text-[var(--fg-secondary)]">Lower Quality = Smaller File.</p>
            </div>

            <div className="border-t border-[var(--border)] pt-4 space-y-2 mt-auto">
                <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Original</span> <span className="font-mono">{formatBytes(stats.originalSize)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Compressed</span> <span className="font-mono text-green-600">{stats.compressedSize > 0 ? formatBytes(stats.compressedSize) : "-"}</span></div>
                {stats.saved > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Saved</span> <span className="font-mono text-green-600">{stats.saved.toFixed(1)}%</span></div>
                )}
            </div>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Input Preview</span>
                <FileText size={12} />
            </div>

            <div className="flex-1 relative overflow-auto flex items-center justify-center p-4">
                {!file && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-4 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors z-10"
                    >
                        <Upload size={32} className="text-red-500 mb-2" />
                        <p className="font-medium text-[var(--fg)]">Drop PDF file here</p>
                        <p className="text-xs text-[var(--fg-secondary)]">or click to browse</p>
                    </div>
                )}

                {file && (
                    <canvas ref={canvasRef} className="max-w-full max-h-full shadow-xl border border-[var(--border)]"></canvas>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[var(--bg)]">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
                <Minimize2 size={48} className="text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-[var(--fg)] mb-2">Reduce File Size</h2>
            <p className="text-sm text-[var(--fg-secondary)] mb-6">
                Compression works by re-rendering pages as optimized JPEGs.
            </p>

            <button
                onClick={startCompression}
                disabled={!file || isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative overflow-hidden"
            >
                {isProcessing ? (
                    <>
                        <RefreshCw size={16} className="animate-spin" />
                        Compressing... {progress}%
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        Compress PDF
                    </>
                )}

                {isProcessing && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all" style={{ width: `${progress}%` }}></div>
                )}
            </button>

            {stats.saved > 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        Saved {stats.saved.toFixed(1)}% ({formatBytes(stats.originalSize - stats.compressedSize)})
                    </p>
                </div>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Compress PDF</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Control Quality</h3>
                    <p className="text-[var(--fg-secondary)]">Adjust DPI and JPEG quality to find the perfect balance between file size and visual fidelity.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Browser-Based</h3>
                    <p className="text-[var(--fg-secondary)]">Compression happens directly in your browser. Your files are never uploaded to any server.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Compress PDF"
            filename="compressed.pdf"
            defaultFilename="compressed.pdf"
            extension="pdf"
            toolId="pdf-compress"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the button to compress and download.")}
            onDownload={startCompression}
        />
    );
}