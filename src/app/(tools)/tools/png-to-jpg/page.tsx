"use client";

import { useState, useRef, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    Upload,
    Download,
    RefreshCw,
    Image as ImageIcon,
    MoveHorizontal,
    Palette,
    Minimize2
} from "lucide-react";

export default function PngToJpgPage() {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string>("");
    const [convertedUrl, setConvertedUrl] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Settings
    const [quality, setQuality] = useState(90);
    const [bgColor, setBgColor] = useState("#ffffff");
    const [maxWidth, setMaxWidth] = useState(4000);
    const [originalMaxWidth, setOriginalMaxWidth] = useState(4000);

    const [stats, setStats] = useState({
        originalSize: 0,
        convertedSize: 0,
        width: 0,
        height: 0
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- Handlers ---

    const handleFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file.");
            return;
        }

        // Cleanup
        if (originalPreview) URL.revokeObjectURL(originalPreview);
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);

        setOriginalFile(file);
        setConvertedUrl("");

        const objectUrl = URL.createObjectURL(file);
        setOriginalPreview(objectUrl);

        // Read dimensions
        const img = new Image();
        img.src = objectUrl;
        img.onload = () => {
            setOriginalMaxWidth(img.width);
            setMaxWidth(img.width);
            setStats(prev => ({ ...prev, originalSize: file.size, width: img.width, height: img.height }));
        };
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    // --- Core Conversion Logic ---

    const convertImage = () => {
        if (!originalFile || !originalPreview) return;

        setIsProcessing(true);

        const img = new Image();
        img.src = originalPreview;

        img.onload = () => {
            try {
                const canvas = canvasRef.current;
                if (!canvas) throw new Error("Canvas not available");

                let width = img.width;
                let height = img.height;

                // Resize logic
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Context not available");

                // 1. Fill Background Color (Handles Transparency)
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, width, height);

                // 2. Draw Image
                ctx.drawImage(img, 0, 0, width, height);

                // 3. Convert to JPG Blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        toast.error("Conversion failed.");
                        setIsProcessing(false);
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    setConvertedUrl(url);
                    setStats(prev => ({ ...prev, convertedSize: blob.size, width, height }));
                    setIsProcessing(false);
                    toast.success("Converted to JPG!");
                }, "image/jpeg", quality / 100);
            } catch (e) {
                console.error(e);
                toast.error("An error occurred during conversion.");
                setIsProcessing(false);
            }
        };
        img.onerror = () => {
            toast.error("Failed to load image.");
            setIsProcessing(false);
        };
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
                    min="10" max="100"
                    value={quality}
                    onChange={(e) => setQuality(+e.target.value)}
                    className="w-24 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-xs font-mono text-[var(--accent)] w-8">{quality}%</span>
            </div>

            {/* Background Color */}
            <div className="flex items-center gap-2">
                <Palette size={14} className="text-[var(--fg-secondary)]" />
                <span className="text-xs font-medium text-[var(--fg)]">BG:</span>
                <div className="relative">
                    <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border border-[var(--border)] p-0 bg-transparent"
                    />
                </div>
                <span className="text-xs font-mono text-[var(--fg-secondary)]">{bgColor.toUpperCase()}</span>
            </div>

            {/* Max Width */}
            <div className="flex items-center gap-2 flex-1">
                <MoveHorizontal size={14} className="text-[var(--fg-secondary)]" />
                <span className="text-xs font-medium text-[var(--fg)]">Max Width:</span>
                <input
                    type="range"
                    min="100"
                    max={originalMaxWidth}
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(+e.target.value)}
                    className="flex-1 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
                <span className="text-xs font-mono text-[var(--accent)] w-16 text-right">
                    {maxWidth >= originalMaxWidth ? "Original" : `${maxWidth}px`}
                </span>
            </div>

            <button
                onClick={convertImage}
                disabled={!originalFile || isProcessing}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
                <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} />
                {isProcessing ? "Converting..." : "Convert to JPG"}
            </button>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider">
                Original Input
            </div>

            <div className="flex-1 relative bg-[var(--bg-secondary)] overflow-hidden flex items-center justify-center">
                {!originalFile && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-[var(--accent-light)] transition-colors"
                    >
                        <div className="p-4 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center bg-[var(--bg)]">
                            <Upload size={32} className="text-[var(--accent)] mb-2" />
                            <p className="text-sm font-medium text-[var(--fg)]">Drop PNG or Click</p>
                            <p className="text-xs text-[var(--fg-secondary)] mt-1">Supports PNG, WebP, GIF</p>
                        </div>
                    </div>
                )}

                {originalPreview && (
                    <img src={originalPreview} alt="Original" className="max-w-full max-h-full object-contain" />
                )}
            </div>

            <div className="h-8 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between px-4 text-[10px] font-mono text-[var(--fg-secondary)]">
                <span>Size: <span className="text-[var(--fg)]">{formatBytes(stats.originalSize)}</span></span>
                <span>Dims: <span className="text-[var(--fg)]">{stats.width} × {stats.height}</span></span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1 border-b border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider flex justify-between">
                <span>JPG Output</span>
                {stats.convertedSize > 0 && (
                    <span className="flex items-center gap-1">
                        {sizeDiff > 0 ? "⚠️ Larger" : "✅ Smaller"} by {Math.abs(parseFloat(percentChange))}%
                    </span>
                )}
            </div>

            <div className="flex-1 relative bg-white dark:bg-zinc-900 overflow-hidden flex items-center justify-center">
                {!convertedUrl ? (
                    <div className="text-center text-xs text-[var(--fg-secondary)]">
                        <ImageIcon size={24} className="mx-auto mb-2 opacity-20" />
                        JPG output will appear here
                    </div>
                ) : (
                    <img src={convertedUrl} alt="Converted" className="max-w-full max-h-full object-contain" />
                )}
            </div>

            <div className={`h-8 border-t flex items-center justify-between px-4 text-[10px] font-mono ${stats.convertedSize > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300' : 'bg-[var(--bg-secondary)] text-[var(--fg-secondary)]'}`}>
                <span>Size: {stats.convertedSize > 0 ? formatBytes(stats.convertedSize) : "-"}</span>
                <span>
                    {stats.convertedSize > 0 ? (
                        <>
                            {sizeDiff > 0 ? "+" : ""}{formatBytes(sizeDiff)} ({percentChange}%)
                        </>
                    ) : "-"}
                </span>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">PNG to JPG Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Transparency Handling</h3>
                    <p className="text-[var(--fg-secondary)]">JPG does not support transparency. This tool allows you to set a custom background color (default: white) to fill transparent areas seamlessly.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Quality Control</h3>
                    <p className="text-[var(--fg-secondary)]">Adjust the JPG quality to balance file size and image clarity. Perfect for optimizing images for the web.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="PNG to JPG"
            filename="image.jpg"
            defaultFilename="image.jpg"
            extension="jpg"
            toolId="png-to-jpg"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => toast.info("Use the download button to save the JPG.")}
            onDownload={downloadImage}
        />
    );
}