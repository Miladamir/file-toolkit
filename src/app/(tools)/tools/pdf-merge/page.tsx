"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import {
    Upload,
    Download,
    Trash2,
    FileText,
    GripVertical,
    RefreshCw,
    Plus
} from "lucide-react";

interface PdfFile {
    id: string;
    file: File;
    name: string;
    pageCount: number;
    buffer: ArrayBuffer | null;
    isLoading: boolean;
}

export default function PdfMergePage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- File Handling ---

    const handleFilesAdded = async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);

        // Filter for PDFs only
        const pdfFiles = fileArray.filter(f => f.type === "application/pdf");
        if (pdfFiles.length === 0) {
            toast.error("Only PDF files are supported.");
            return;
        }

        // Create initial state with loading true
        const newItems: PdfFile[] = pdfFiles.map(f => ({
            id: URL.createObjectURL(f) + Date.now(),
            file: f,
            name: f.name,
            pageCount: 0,
            buffer: null,
            isLoading: true
        }));

        // Add to list immediately
        setFiles(prev => [...prev, ...newItems]);

        // Read page counts asynchronously
        for (let i = 0; i < newItems.length; i++) {
            const item = newItems[i];
            try {
                const buffer = await item.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(buffer);
                const pageCount = pdfDoc.getPageCount();

                // Update specific item in state
                setFiles(prev => prev.map(f =>
                    f.id === item.id
                        ? { ...f, pageCount, buffer, isLoading: false }
                        : f
                ));
            } catch (e) {
                console.error("Error reading PDF", e);
                toast.error(`Failed to read ${item.name}`);
                // Remove corrupted file
                setFiles(prev => prev.filter(f => f.id !== item.id));
            }
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFilesAdded(e.dataTransfer.files);
    };

    const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));
    const clearAll = () => setFiles([]);

    // --- Drag & Drop Reordering ---

    const handleDragStart = (e: DragEvent, index: number) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: DragEvent, index: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === index) return;

        const newFiles = [...files];
        const draggedItem = newFiles[dragIndex];
        newFiles.splice(dragIndex, 1);
        newFiles.splice(index, 0, draggedItem);
        setFiles(newFiles);
        setDragIndex(index);
    };

    const handleDragEnd = () => setDragIndex(null);

    // --- Merge Logic ---

    const mergePDFs = async () => {
        if (files.length < 2) {
            toast.error("Please add at least two PDFs to merge.");
            return;
        }

        setIsMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const item of files) {
                // If buffer isn't ready (rare race condition), read it
                let buffer = item.buffer;
                if (!buffer) {
                    buffer = await item.file.arrayBuffer();
                }

                const doc = await PDFDocument.load(buffer);
                const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();

            // FIX: Cast buffer to ArrayBuffer to satisfy BlobPart type requirement
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = "merged-document.pdf";
            a.click();
            URL.revokeObjectURL(url);

            toast.success("PDFs Merged Successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to merge PDFs.");
        } finally {
            setIsMerging(false);
        }
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center gap-4 h-full w-full">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-md text-xs font-semibold hover:opacity-90"
            >
                <Plus size={14} /> Add PDFs
            </button>

            {files.length > 0 && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950"
                >
                    <Trash2 size={14} /> Clear All
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Drop Zone Overlay (Visible only when empty) */}
            {files.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[var(--border)] rounded-xl w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <Upload size={32} className="text-red-500 mb-2" />
                        <p className="font-medium text-[var(--fg)]">Drop PDF files here</p>
                        <p className="text-xs text-[var(--fg-secondary)]">or click to browse</p>
                    </div>
                </div>
            )}

            {/* File List */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
                {files.map((item, index) => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-3 bg-[var(--bg)] p-3 rounded-lg border ${dragIndex === index ? 'border-red-500 opacity-50' : 'border-[var(--border)]'} cursor-grab active:cursor-grabbing transition-all`}
                    >
                        <GripVertical size={16} className="text-[var(--fg-secondary)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-sm truncate text-[var(--fg)]">{item.name}</span>
                                <button onClick={() => removeFile(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="text-[10px] text-[var(--fg-secondary)] font-mono mt-1">
                                {item.isLoading ? "Reading..." : `${item.pageCount} Pages`}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add more button at bottom if items exist */}
                {files.length > 0 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-3 text-xs text-[var(--fg-secondary)] hover:bg-[var(--bg)] transition-colors"
                    >
                        + Add more files
                    </button>
                )}
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[var(--bg)]">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
                <FileText size={48} className="text-red-600" />
            </div>

            <h2 className="text-xl font-bold text-[var(--fg)] mb-2">Merge {files.length} Files</h2>
            <p className="text-sm text-[var(--fg-secondary)] mb-6">
                Total: {files.reduce((acc, f) => acc + f.pageCount, 0)} Pages
            </p>

            <button
                onClick={mergePDFs}
                disabled={files.length < 2 || isMerging}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isMerging ? (
                    <>
                        <RefreshCw size={16} className="animate-spin" />
                        Merging...
                    </>
                ) : (
                    <>
                        <Download size={16} />
                        Merge & Download
                    </>
                )}
            </button>

            {files.length > 0 && files.length < 2 && (
                <p className="text-xs text-red-500 mt-3">Add at least 2 PDF files to merge.</p>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Merge PDF Files</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Easy Organization</h3>
                    <p className="text-[var(--fg-secondary)]">Drag and drop to reorder files exactly how you want them. Combine invoices, reports, or presentations into a single document.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Private & Secure</h3>
                    <p className="text-[var(--fg-secondary)]">All merging happens locally in your browser. Your files are never uploaded to any server.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Merge PDF"
            filename="merged.pdf"
            defaultFilename="merged.pdf"
            extension="pdf"
            toolId="pdf-merge"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the button in the preview area to merge and download.")}
            onDownload={mergePDFs}
        />
    );
}