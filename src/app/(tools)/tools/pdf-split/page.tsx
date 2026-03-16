"use client";

import { useState, useRef, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import {
    Upload,
    Download,
    FileText,
    Scissors,
    Layers,
    RefreshCw,
    FileOutput
} from "lucide-react";

type SplitMode = "range" | "chunk" | "all";

export default function PdfSplitPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [mode, setMode] = useState<SplitMode>("range");
    const [rangeInput, setRangeInput] = useState("");
    const [chunkSize, setChunkSize] = useState(1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfDocRef = useRef<PDFDocument | null>(null);

    // --- Handlers ---

    const handleFile = async (file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Please upload a valid PDF file.");
            return;
        }

        setFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            pdfDocRef.current = pdfDoc;
            setPageCount(pdfDoc.getPageCount());
        } catch (e) {
            toast.error("Failed to read PDF file.");
            console.error(e);
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const clearFile = () => {
        setFile(null);
        setPageCount(0);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
        pdfDocRef.current = null;
        setRangeInput("");
        setChunkSize(1);
    };

    // --- Split Logic ---

    const processSplit = async () => {
        if (!file || !pdfDocRef.current) return;

        setIsProcessing(true);

        try {
            const srcDoc = pdfDocRef.current;
            const total = srcDoc.getPageCount();

            if (mode === "range") {
                await splitByRange(srcDoc);
            } else if (mode === "chunk") {
                await splitByChunk(srcDoc, total);
            } else {
                await splitAll(srcDoc, total);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during splitting.");
        } finally {
            setIsProcessing(false);
        }
    };

    const splitByRange = async (srcDoc: PDFDocument) => {
        if (!rangeInput.trim()) {
            toast.error("Please enter page ranges.");
            return;
        }

        const pages = parsePageRanges(rangeInput, srcDoc.getPageCount());
        if (pages.length === 0) {
            toast.error("Invalid page range.");
            return;
        }

        const newDoc = await PDFDocument.create();
        const indices = pages.map(p => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach(page => newDoc.addPage(page));

        const pdfBytes = await newDoc.save();
        downloadBlob(pdfBytes, `Split_${file?.name || "document.pdf"}`);
        toast.success("PDF split successfully!");
    };

    const splitByChunk = async (srcDoc: PDFDocument, total: number) => {
        if (chunkSize < 1) {
            toast.error("Pages per file must be at least 1.");
            return;
        }

        const zip = new JSZip();

        for (let i = 0; i < total; i += chunkSize) {
            const end = Math.min(i + chunkSize, total);
            const indices = Array.from({ length: end - i }, (_, k) => i + k);

            const newDoc = await PDFDocument.create();
            const copiedPages = await newDoc.copyPages(srcDoc, indices);
            copiedPages.forEach(page => newDoc.addPage(page));

            const pdfBytes = await newDoc.save();
            // FIX: Cast buffer to ArrayBuffer to satisfy JSZip types
            zip.file(`Part_${(i / chunkSize + 1)}.pdf`, pdfBytes.buffer as ArrayBuffer);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, `Split_Chunks.zip`);
        toast.success("PDFs zipped and downloaded!");
    };

    const splitAll = async (srcDoc: PDFDocument, total: number) => {
        const zip = new JSZip();

        for (let i = 0; i < total; i++) {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copiedPage);
            const pdfBytes = await newDoc.save();
            // FIX: Cast buffer to ArrayBuffer to satisfy JSZip types
            zip.file(`Page_${i + 1}.pdf`, pdfBytes.buffer as ArrayBuffer);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, `All_Pages.zip`);
        toast.success("All pages extracted!");
    };

    // --- Utils ---

    const parsePageRanges = (str: string, max: number): number[] => {
        const pages = new Set<number>();
        const parts = str.split(",");

        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes("-")) {
                const [startStr, endStr] = trimmed.split("-");
                const start = parseInt(startStr);
                const end = parseInt(endStr);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i > 0 && i <= max) pages.add(i);
                    }
                }
            } else {
                const num = parseInt(trimmed);
                if (!isNaN(num) && num > 0 && num <= max) pages.add(num);
            }
        });

        return Array.from(pages).sort((a, b) => a - b);
    };

    const downloadBlob = (data: Blob | Uint8Array, name: string) => {
        // FIX: Cast buffer to ArrayBuffer to satisfy Blob constructor types
        const blob = data instanceof Uint8Array
            ? new Blob([data.buffer as ArrayBuffer])
            : data;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            {file && (
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] space-y-2">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-red-600" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-[var(--fg-secondary)] font-mono">{pageCount} Pages</p>
                        </div>
                        <button onClick={clearFile} className="text-xs text-red-500 hover:underline">Clear</button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Split Mode</h3>

                <OptionRadio
                    selected={mode === "range"}
                    onChange={() => setMode("range")}
                    title="Extract by Range"
                    description="e.g. 1-3, 5, 8"
                    icon={<Scissors size={16} />}
                />
                {mode === "range" && (
                    <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder="1-3, 5"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-red-500"
                    />
                )}

                <OptionRadio
                    selected={mode === "chunk"}
                    onChange={() => setMode("chunk")}
                    title="Split by Interval"
                    description="Split every X pages"
                    icon={<Layers size={16} />}
                />
                {mode === "chunk" && (
                    <input
                        type="number"
                        min="1"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(parseInt(e.target.value))}
                        placeholder="Pages per file"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                    />
                )}

                <OptionRadio
                    selected={mode === "all"}
                    onChange={() => setMode("all")}
                    title="Extract All Pages"
                    description="Save every page separately"
                    icon={<FileOutput size={16} />}
                />
            </div>

            <div className="flex-1" />

            <button
                onClick={processSplit}
                disabled={!file || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                {isProcessing ? "Processing..." : "Split PDF"}
            </button>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider">
                Controls
            </div>

            {!file && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 p-6"
                >
                    <div className="border-2 border-dashed border-[var(--border)] rounded-xl w-full h-full flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <Upload size={32} className="text-red-500 mb-2" />
                        <p className="font-medium text-[var(--fg)]">Drop PDF file here</p>
                        <p className="text-xs text-[var(--fg-secondary)]">or click to browse</p>
                    </div>
                </div>
            )}

            {file && Controls}

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
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-red-50 dark:bg-red-900/30 px-4 py-1 border-b border-red-200 dark:border-red-800 text-[10px] font-bold text-red-600 dark:text-red-300 uppercase tracking-wider">
                PDF Preview
            </div>

            <div className="flex-1 overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                {previewUrl ? (
                    <embed
                        src={previewUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                        className="pointer-events-none"
                    />
                ) : (
                    <div className="text-center text-xs text-[var(--fg-secondary)]">
                        <FileText size={24} className="mx-auto mb-2 opacity-20" />
                        Preview
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Split PDF Files</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Flexible Extraction</h3>
                    <p className="text-[var(--fg-secondary)]">Extract specific pages by range (e.g. 1-3, 5), split files into fixed-size chunks, or separate every page into a new document.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Private Processing</h3>
                    <p className="text-[var(--fg-secondary)]">Files are processed entirely in your browser. No uploads, no servers. Your documents stay private.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Split PDF"
            filename="split.zip"
            defaultFilename="split.zip"
            extension="zip"
            toolId="pdf-split"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Configure options in the left panel.")}
            onDownload={processSplit}
        />
    );
}

function OptionRadio({ selected, onChange, title, description, icon }: { selected: boolean; onChange: () => void; title: string; description: string; icon: React.ReactNode }) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selected ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "hover:bg-[var(--bg-secondary)] border border-transparent"}`}>
            <input type="radio" checked={selected} onChange={onChange} className="mt-1 accent-red-600" />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-[var(--fg)]">{title}</span>
                    <span className="text-red-600">{icon}</span>
                </div>
                <p className="text-xs text-[var(--fg-secondary)] mt-0.5">{description}</p>
            </div>
        </label>
    );
}