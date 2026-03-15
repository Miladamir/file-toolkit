"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    Upload,
    Download,
    Image as ImageIcon,
    Settings2,
    Minimize2,
    FileType,
    ArrowRight,
    CheckCircle
} from "lucide-react";

interface ImageStats {
    originalSize: number;
    compressedSize: number;
    originalDimensions: string;
    compressedDimensions: string;
    saved: string;
}

export default function ImageCompressorPage() {
    // State
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [compressedPreview, setCompressedPreview] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState<ImageStats | null>(null);

    // Settings
    const [quality, setQuality] = useState(80);
    const [maxWidth, setMaxWidth] = useState(1920);
    const [format, setFormat] = useState<"auto" | "jpeg" | "webp" | "png">("auto");

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (originalPreview) URL.revokeObjectURL(originalPreview);
            if (compressedPreview) URL.revokeObjectURL(compressedPreview);
        };
    }, [originalPreview, compressedPreview]);

    // --- Handlers ---

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file.");
            return;
        }

        // Cleanup previous
        if (originalPreview) URL.revokeObjectURL(originalPreview);
        if (compressedPreview) URL.revokeObjectURL(compressedPreview);

        setOriginalFile(file);
        setCompressedPreview("");
        setStats(null);

        const objectUrl = URL.createObjectURL(file);
        setOriginalPreview(objectUrl);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    // --- Core Compression Logic ---

    const processImage = async () => {
        if (!originalFile) return;

        setIsProcessing(true);

        try {
            // 1. Load Image
            const img = new Image();
            img.src = originalPreview;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // 2. Calculate Dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            // 3. Draw to Canvas
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas not ready");

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Context not ready");

            ctx.drawImage(img, 0, 0, width, height);

            // 4. Determine Mime Type
            let mimeType = `image/${format}`;
            if (format === "auto") {
                // Default to original, but fallback to jpeg for gifs/bmps to avoid animation issues
                mimeType = originalFile.type === "image/gif" || originalFile.type === "image/bmp"
                    ? "image/jpeg"
                    : originalFile.type;
            }
            // Ensure valid mime type for canvas
            if (!["image/jpeg", "image/webp", "image/png"].includes(mimeType)) {
                mimeType = "image/jpeg";
            }

            // 5. Convert to Blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    toast.error("Compression failed.");
                    setIsProcessing(false);
                    return;
                }

                // Create Preview URL
                const url = URL.createObjectURL(blob);
                setCompressedPreview(url);

                // Calculate Stats
                const savedBytes = originalFile.size - blob.size;
                const savedPercent = ((savedBytes / originalFile.size) * 100).toFixed(1);

                setStats({
                    originalSize: originalFile.size,
                    compressedSize: blob.size,
                    originalDimensions: `${img.width} × ${img.height}`,
                    compressedDimensions: `${width} × ${height}`,
                    saved: `${savedPercent}%`
                });

                setIsProcessing(false);
                toast.success("Image compressed!");
            }, mimeType, quality / 100);

        } catch (err) {
            console.error(err);
            toast.error("Failed to process image.");
            setIsProcessing(false);
        }
    };

    const downloadImage = () => {
        if (!compressedPreview) return;
        const link = document.createElement("a");
        link.href = compressedPreview;
        const ext = format === "auto" ? originalFile?.name.split('.').pop() : format;
        link.download = `compressed-image.${ext}`;
        link.click();
    };

    // --- UI Slots ---

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const Controls = (
        <div className="p-6 space-y-6 h-full overflow-auto bg-[var(--bg)]">
            {/* Quality */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-[var(--fg)]">
                    <span className="flex items-center gap-2"><Minimize2 size={12} /> Quality</span>
                    <span className="text-[var(--accent)] font-mono">{quality}%</span>
                </div>
                <input
                    type="range"
                    min="10" max="100"
                    value={quality}
                    onChange={(e) => setQuality(+e.target.value)}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
            </div>

            {/* Resize */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-[var(--fg)]">
                    <span className="flex items-center gap-2"><ImageIcon size={12} /> Max Width</span>
                    <span className="text-[var(--accent)] font-mono">{maxWidth}px</span>
                </div>
                <input
                    type="range"
                    min="100" max="4000"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(+e.target.value)}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
            </div>

            {/* Format */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--fg)] flex items-center gap-2">
                    <FileType size={12} /> Output Format
                </label>
                <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                    <option value="auto">Auto (Same as Original)</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP (Recommended)</option>
                    <option value="png">PNG</option>
                </select>
            </div>

            <button
                onClick={processImage}
                disabled={!originalFile || isProcessing}
                className="w-full py-2.5 bg-[var(--accent)] text-white rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? "Processing..." : "Apply Compression"}
            </button>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Settings</span>
                <Settings2 size={12} />
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
                {Controls}
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col relative">
            {/* Hidden Canvas for Processing */}
            <canvas ref={canvasRef} className="hidden"></canvas>

            {/* Drop Zone / Preview Area */}
            <div
                className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-auto"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {/* Original */}
                <div className="flex flex-col border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-secondary)]">
                    <div className="px-3 py-2 bg-[var(--bg)] border-b border-[var(--border)] text-xs font-bold text-[var(--fg-secondary)] flex justify-between">
                        <span>ORIGINAL</span>
                        <span>{stats?.originalDimensions || "-"}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-2 min-h-[200px] relative">
                        {!originalFile ? (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex flex-col items-center justify-center text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors border-2 border-dashed border-[var(--border)] m-4 rounded-lg hover:border-[var(--accent)]"
                            >
                                <Upload size={32} strokeWidth={1} />
                                <span className="mt-2 text-xs font-medium">Upload Image</span>
                            </button>
                        ) : (
                            <img src={originalPreview} alt="Original" className="max-w-full max-h-full object-contain" />
                        )}
                    </div>
                    <div className="px-3 py-1 bg-[var(--bg)] border-t border-[var(--border)] text-xs font-mono text-[var(--fg-secondary)]">
                        Size: {originalFile ? formatBytes(originalFile.size) : "-"}
                    </div>
                </div>

                {/* Compressed */}
                <div className={`flex flex-col border rounded-lg overflow-hidden bg-[var(--bg-secondary)] ${compressedPreview ? "border-green-500 border-2" : "border-[var(--border)]"}`}>
                    <div className="px-3 py-2 bg-[var(--bg)] border-b border-[var(--border)] text-xs font-bold flex justify-between">
                        <span className={compressedPreview ? "text-green-600" : "text-[var(--fg-secondary)]"}>COMPRESSED</span>
                        <span>{stats?.compressedDimensions || "-"}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-2 min-h-[200px] relative bg-[var(--bg)] bg-[url('/checkerboard.svg')]">
                        {compressedPreview ? (
                            <img src={compressedPreview} alt="Compressed" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center text-xs text-[var(--fg-secondary)]">
                                <ArrowRight size={24} className="mx-auto mb-2 opacity-30" />
                                <span>Result will appear here</span>
                            </div>
                        )}
                    </div>
                    <div className="px-3 py-1 bg-[var(--bg)] border-t border-[var(--border)] text-xs font-mono flex justify-between">
                        <span className="text-[var(--fg-secondary)]">Size: {stats ? formatBytes(stats.compressedSize) : "-"}</span>
                        {stats && (
                            <span className="font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Saved {stats.saved}
                            </span>
                        )}
                    </div>
                </div>
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

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Image Compressor</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Client-Side Processing</h3>
                    <p className="text-[var(--fg-secondary)]">Images are processed directly in your browser using the HTML5 Canvas API. Your files are never uploaded to any server.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">WebP Support</h3>
                    <p className="text-[var(--fg-secondary)]">Convert images to WebP for superior compression and quality, ideal for modern web performance.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Image Compressor"
            filename="compressed.jpg"
            defaultFilename="compressed.jpg"
            extension="jpg"
            toolId="image-compressor"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the download button to save the image.")}
            onDownload={downloadImage}
        />
    );
}