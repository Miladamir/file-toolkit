"use client";

import { useState, useRef, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    Upload,
    Download,
    RefreshCw,
    FileImage,
    Minimize2,
    AlertCircle
} from "lucide-react";
// @ts-ignore - heic2any types are loose
import heic2any from "heic2any";

export default function HeicToJpgPage() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [convertedUrl, setConvertedUrl] = useState<string>("");
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Settings
    const [quality, setQuality] = useState(0.9);

    const [stats, setStats] = useState({
        originalSize: 0,
        convertedSize: 0,
        dimensions: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Handlers ---

    const handleFile = (file: File) => {
        const isHeic = file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");

        if (!isHeic) {
            toast.error("Please upload a valid HEIC/HEIF file.");
            return;
        }

        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        setConvertedUrl("");
        setError(null);
        setOriginalFile(file);
        setStats({ originalSize: file.size, convertedSize: 0, dimensions: "" });
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    // --- Core Conversion Logic ---

    const convertImage = async () => {
        if (!originalFile) return;

        setIsConverting(true);
        setError(null);

        try {
            // heic2any does not support resizing directly.
            // We convert to JPEG with the specified quality.
            const resultBlob = await heic2any({
                blob: originalFile,
                toType: "image/jpeg",
                quality: quality,
            });

            // Handle potential array return (though unlikely without 'multiple: true')
            const finalBlob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;

            const url = URL.createObjectURL(finalBlob);
            setConvertedUrl(url);
            setStats(prev => ({ ...prev, convertedSize: finalBlob.size }));

            // Read dimensions
            const img = new Image();
            img.src = url;
            img.onload = () => setStats(prev => ({ ...prev, dimensions: `${img.width} × ${img.height}` }));

            toast.success("Converted successfully!");
        } catch (err: any) {
            console.error(err);
            setError("Conversion failed. The file might be corrupted or an unsupported HEIC variant.");
            toast.error("Conversion failed.");
        } finally {
            setIsConverting(false);
        }
    };

    const downloadImage = () => {
        if (!convertedUrl || !originalFile) return;
        const link = document.createElement("a");
        link.href = convertedUrl;
        const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
        link.download = `${baseName}.jpg`;
        link.click();
    };

    // --- Utils ---

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizeName = sizes[i] || 'Bytes';
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizeName;
    };

    const sizeDiff = stats.convertedSize - stats.originalSize;
    const percentChange = stats.originalSize > 0
        ? ((sizeDiff / stats.originalSize) * 100).toFixed(1)
        : "0.0";

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center gap-6 h-full w-full">
            {/* Quality */}
            <div className="flex items-center gap-2">
                <Minimize2 size={14} className="text-[var(--fg-secondary)]" />
                <span className="text-xs font-medium text-[var(--fg)]">Quality:</span>
                <input
                    type="range"
                    min="0.1" max="1.0" step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-32 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-xs font-mono text-[var(--accent)] w-10">{Math.round(quality * 100)}%</span>
            </div>

            <div className="flex-1" />

            <button
                onClick={convertImage}
                disabled={!originalFile || isConverting}
                className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-md text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
                <RefreshCw size={14} className={isConverting ? "animate-spin" : ""} />
                {isConverting ? "Converting..." : "Convert to JPG"}
            </button>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Drop Zone */}
            {!originalFile ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                >
                    <div className="p-6 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center bg-[var(--bg)] max-w-sm">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                            <FileImage size={32} className="text-purple-600" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--fg)]">Drop HEIC File Here</p>
                        <p className="text-xs text-[var(--fg-secondary)] mt-1 text-center">
                            iPhone photos (.heic, .heif)
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                        <FileImage size={40} className="text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg text-[var(--fg)]">{originalFile.name}</h3>
                    <p className="text-sm text-[var(--fg-secondary)] font-mono mt-1">{formatBytes(stats.originalSize)}</p>

                    {!convertedUrl && !isConverting && (
                        <button
                            onClick={() => { setOriginalFile(null); setStats({ originalSize: 0, convertedSize: 0, dimensions: "" }); }}
                            className="mt-4 text-xs text-red-500 hover:underline"
                        >
                            Clear Selection
                        </button>
                    )}
                </div>
            )}

            {isConverting && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                    <RefreshCw size={32} className="text-purple-600 animate-spin mb-4" />
                    <span className="text-sm font-medium text-[var(--fg)]">Decoding HEIC...</span>
                    <span className="text-xs text-[var(--fg-secondary)] mt-1">This may take a moment</span>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/heic,image/heif,.heic,.heif"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-1 border-b border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider flex justify-between">
                <span>JPG Output</span>
                {stats.convertedSize > 0 && (
                    <span className="flex items-center gap-1">
                        {sizeDiff > 0 ? "⚠️ Larger" : "✅ Smaller"} by {Math.abs(parseFloat(percentChange))}%
                    </span>
                )}
            </div>

            <div className="flex-1 relative bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                {error && (
                    <div className="flex flex-col items-center gap-2 text-red-500 text-sm p-8 text-center">
                        <AlertCircle size={24} />
                        <span>{error}</span>
                    </div>
                )}

                {!convertedUrl && !error && !isConverting && (
                    <div className="text-center text-xs text-[var(--fg-secondary)]">
                        JPG Preview
                    </div>
                )}

                {convertedUrl && (
                    <img src={convertedUrl} alt="Converted" className="max-w-full max-h-full object-contain" />
                )}
            </div>

            <div className={`h-8 border-t flex items-center justify-between px-4 text-[10px] font-mono ${stats.convertedSize > 0 ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-[var(--bg-secondary)] text-[var(--fg-secondary)]'}`}>
                <span>Size: {stats.convertedSize > 0 ? formatBytes(stats.convertedSize) : "-"}</span>
                <span>Dims: {stats.dimensions || "-"}</span>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">HEIC to JPG Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">iOS Photo Support</h3>
                    <p className="text-[var(--fg-secondary)]">Convert iPhone HEIC photos to JPG format instantly. No software installation required.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Client-Side Privacy</h3>
                    <p className="text-[var(--fg-secondary)]">Images are processed entirely in your browser using WebAssembly. Your photos are never uploaded to a server.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="HEIC to JPG"
            filename="image.jpg"
            defaultFilename="image.jpg"
            extension="jpg"
            toolId="heic-to-jpg"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the download button to save the JPG.")}
            onDownload={downloadImage}
        />
    );
}