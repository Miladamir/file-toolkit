"use client";

import { useState, useRef, useEffect, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import {
    Upload,
    Download,
    FileText,
    Maximize2,
    MoveHorizontal,
    Layers,
    Scaling // Changed from Fit to Scaling
} from "lucide-react";

interface PDFSettings {
    format: "a4" | "letter" | "legal";
    orientation: "portrait" | "landscape" | "auto";
    margin: number; // in mm
    fit: "contain" | "cover" | "stretch";
}

export default function ImageToPdfPage() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [settings, setSettings] = useState<PDFSettings>({
        format: "a4",
        orientation: "portrait",
        margin: 10,
        fit: "contain"
    });

    const [stats, setStats] = useState({
        name: "",
        dimensions: "",
        size: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // --- Core Logic ---

    useEffect(() => {
        if (originalFile) generatePDF();
    }, [settings, originalFile]);

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file.");
            return;
        }

        // Cleanup
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl("");

        setOriginalFile(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);

        // Read dimensions
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
            setStats({
                name: file.name,
                dimensions: `${img.width} × ${img.height}`,
                size: formatBytes(file.size)
            });
        };
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const generatePDF = async () => {
        if (!originalFile || !imagePreview) return;

        setIsProcessing(true);

        try {
            // 1. Load Image data
            const img = imageRef.current || new Image();
            if (!imageRef.current) img.src = imagePreview;

            // Wait for load if needed
            if (!img.complete) await new Promise(r => img.onload = r);

            // 2. Determine Orientation
            let orientation = settings.orientation;
            if (orientation === "auto") {
                orientation = img.width > img.height ? "landscape" : "portrait";
            }

            // 3. Initialize jsPDF
            const pdf = new jsPDF({
                orientation: orientation,
                unit: "mm",
                format: settings.format
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = settings.margin;

            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);

            // 4. Calculate Dimensions based on Fit
            let finalWidth, finalHeight, x, y;
            const imgRatio = img.width / img.height;

            if (settings.fit === "stretch") {
                finalWidth = contentWidth;
                finalHeight = contentHeight;
                x = margin;
                y = margin;
            } else {
                // Contain or Cover
                const pageRatio = contentWidth / contentHeight;

                if (settings.fit === "contain") {
                    if (imgRatio > pageRatio) {
                        finalWidth = contentWidth;
                        finalHeight = contentWidth / imgRatio;
                    } else {
                        finalHeight = contentHeight;
                        finalWidth = contentHeight * imgRatio;
                    }
                } else {
                    // Cover
                    if (imgRatio < pageRatio) {
                        finalWidth = contentWidth;
                        finalHeight = contentWidth / imgRatio;
                    } else {
                        finalHeight = contentHeight;
                        finalWidth = contentHeight * imgRatio;
                    }
                }

                // Center
                x = (pageWidth - finalWidth) / 2;
                y = (pageHeight - finalHeight) / 2;
            }

            // 5. Add Image
            const format = originalFile.type === "image/png" ? "PNG" : "JPEG";
            pdf.addImage(imagePreview, format, x, y, finalWidth, finalHeight);

            // 6. Generate Blob
            const output = pdf.output("blob");
            const url = URL.createObjectURL(output);
            setPdfUrl(url);

        } catch (e) {
            console.error(e);
            toast.error("Failed to generate PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadPDF = () => {
        if (!pdfUrl || !originalFile) return;
        const link = document.createElement("a");
        link.href = pdfUrl;
        const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
        link.download = `${baseName}.pdf`;
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

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            {/* Page Format */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><FileText size={12} /> Page Size</label>
                <select
                    value={settings.format}
                    onChange={(e) => setSettings(p => ({ ...p, format: e.target.value as any }))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (8.5 x 11 in)</option>
                    <option value="legal">Legal (8.5 x 14 in)</option>
                </select>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><Maximize2 size={12} /> Orientation</label>
                <select
                    value={settings.orientation}
                    onChange={(e) => setSettings(p => ({ ...p, orientation: e.target.value as any }))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="auto">Auto (Based on Image)</option>
                </select>
            </div>

            {/* Margin */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><MoveHorizontal size={12} /> Margin</label>
                <select
                    value={settings.margin}
                    onChange={(e) => setSettings(p => ({ ...p, margin: parseInt(e.target.value) }))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value={0}>None (0 mm)</option>
                    <option value={10}>Small (10 mm)</option>
                    <option value={20}>Medium (20 mm)</option>
                </select>
            </div>

            {/* Image Fit */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><Scaling size={12} /> Image Fit</label>
                <select
                    value={settings.fit}
                    onChange={(e) => setSettings(p => ({ ...p, fit: e.target.value as any }))}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="contain">Fit (Preserve Aspect Ratio)</option>
                    <option value="cover">Fill (May Crop)</option>
                    <option value="stretch">Stretch (Ignore Ratio)</option>
                </select>
            </div>

            {/* Image Info */}
            {originalFile && (
                <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-md text-xs space-y-1 border border-[var(--border)]">
                    <div className="flex justify-between"><span className="text-[var(--fg-secondary)]">Name:</span> <span className="truncate ml-2 max-w-[150px] text-[var(--fg)]">{stats.name}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--fg-secondary)]">Size:</span> <span className="text-[var(--fg)]">{stats.size}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--fg-secondary)]">Dims:</span> <span className="text-[var(--fg)]">{stats.dimensions}</span></div>
                </div>
            )}
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Input Image</span>
                <Layers size={12} />
            </div>

            <div className="flex-1 relative overflow-auto flex items-center justify-center p-4">
                {/* Drop Zone */}
                {!originalFile && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-4 border-2 border-dashed border-[var(--border)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors z-10"
                    >
                        <Upload size={32} className="text-red-500 mb-2" />
                        <p className="font-medium text-[var(--fg)]">Drop Image Here</p>
                        <p className="text-xs text-[var(--fg-secondary)]">Supports JPG, PNG, WebP</p>
                    </div>
                )}

                {/* Image Preview */}
                {originalFile && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            ref={imageRef}
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain shadow-xl rounded"
                        />
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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

            <div className="flex-1 relative overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                {isProcessing ? (
                    <div className="text-sm text-[var(--fg-secondary)]">Generating PDF...</div>
                ) : pdfUrl ? (
                    <embed
                        src={pdfUrl}
                        type="application/pdf"
                        className="w-full h-full"
                    />
                ) : (
                    <div className="text-center text-xs text-[var(--fg-secondary)]">
                        Upload an image to generate PDF
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Image to PDF Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">All Formats Supported</h3>
                    <p className="text-[var(--fg-secondary)]">Convert JPG, PNG, WebP, GIF, and TIFF images into high-quality PDF documents.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Professional Settings</h3>
                    <p className="text-[var(--fg-secondary)]">Control page size (A4, Letter), orientation, margins, and image fitting options.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Image to PDF"
            filename="document.pdf"
            defaultFilename="document.pdf"
            extension="pdf"
            toolId="image-to-pdf"
            editorSlot={Controls}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the download button to save the PDF.")}
            onDownload={downloadPDF}
        />
    );
}