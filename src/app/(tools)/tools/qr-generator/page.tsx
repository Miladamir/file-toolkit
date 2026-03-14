"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, Link2, Palette, Image as ImageIcon, Trash2 } from "lucide-react";

export default function QRGeneratorPage() {
    // State for QR Data
    const [text, setText] = useState("https://example.com");
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [size, setSize] = useState(400); // px
    const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("H");
    const [logo, setLogo] = useState<string | null>(null);
    const [logoName, setLogoName] = useState("");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Regenerate QR Code when state changes
    useEffect(() => {
        generateQR();
    }, [text, fgColor, bgColor, size, level, logo]);

    const generateQR = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (!text) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        try {
            // Generate base QR code
            await QRCode.toCanvas(canvas, text, {
                width: size,
                margin: 2,
                color: {
                    dark: fgColor,
                    light: bgColor,
                },
                errorCorrectionLevel: level,
            });

            // If logo exists, draw it on top
            if (logo) {
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.src = logo;
                img.onload = () => {
                    const logoSize = size * 0.2; // 20% of size
                    const x = (size - logoSize) / 2;
                    const y = (size - logoSize) / 2;

                    // Draw background patch for logo to ensure visibility
                    ctx!.fillStyle = bgColor;
                    ctx!.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);

                    // Draw logo
                    ctx!.drawImage(img, x, y, logoSize, logoSize);
                };
            }
        } catch (error) {
            console.error("QR Generation Error", error);
        }
    };

    // --- Handlers ---

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            setLogo(evt.target?.result as string);
            setLogoName(file.name);
            toast.success("Logo uploaded! Error correction set to High.");
            setLevel("H"); // Auto-set to High for logo support
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        setLogo(null);
        setLogoName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.info("Logo removed");
    };

    const downloadQR = (format: "png" | "jpg") => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `qrcode.${format}`;

        if (format === "jpg") {
            // Create temp canvas for JPG background
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const ctx = tempCanvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = bgColor; // Use selected bg color
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.drawImage(canvas, 0, 0);
                link.href = tempCanvas.toDataURL("image/jpeg", 0.9);
            }
        } else {
            link.href = canvas.toDataURL("image/png");
        }

        link.click();
        toast.success(`Downloaded as ${format.toUpperCase()}`);
    };

    // --- Slots ---

    const Controls = (
        <div className="p-6 space-y-6 h-full overflow-auto">
            {/* Content Input */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Content</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter URL or text..."
                    className="w-full h-32 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
            </div>

            {/* Color Customization */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Colors</label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-2 rounded-md border border-[var(--border)]">
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-6 h-6 cursor-pointer" />
                        <span className="text-xs font-mono">{fgColor}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-2 rounded-md border border-[var(--border)]">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-6 h-6 cursor-pointer" />
                        <span className="text-xs font-mono">{bgColor}</span>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--fg-secondary)] uppercase">Size</label>
                    <select
                        value={size}
                        onChange={(e) => setSize(+e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-2 text-sm outline-none"
                    >
                        <option value="200">Small (200px)</option>
                        <option value="400">Medium (400px)</option>
                        <option value="800">Large (800px)</option>
                        <option value="1200">XL (1200px)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--fg-secondary)] uppercase">Error Correction</label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-2 text-sm outline-none"
                    >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                    </select>
                </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Logo (Optional)</label>

                {logo ? (
                    <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-2 rounded-md border border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-[var(--accent)]" />
                            <span className="text-xs truncate max-w-[120px]">{logoName}</span>
                        </div>
                        <button onClick={removeLogo} className="text-red-500 hover:text-red-600 p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[var(--border)] rounded-lg p-4 flex flex-col items-center gap-1 text-[var(--fg-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                    >
                        <ImageIcon size={20} />
                        <span className="text-xs">Upload Logo</span>
                    </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
        </div>
    );

    const Preview = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">
            {/* Canvas Container */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[url('/checkerboard.svg')] bg-repeat">
                <canvas
                    ref={canvasRef}
                    className="shadow-xl rounded-lg border border-[var(--border)] max-w-full"
                    style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '80vh' }}
                />
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => downloadQR('png')} className="flex items-center justify-center gap-2 bg-[var(--fg)] text-[var(--bg)] py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity">
                        <Download size={16} /> PNG
                    </button>
                    <button onClick={() => downloadQR('jpg')} className="flex items-center justify-center gap-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--fg)] py-2.5 rounded-md font-medium hover:bg-[var(--bg-secondary)] transition-colors">
                        <Download size={16} /> JPG
                    </button>
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">QR Code Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Fully Customizable</h3>
                    <p className="text-[var(--fg-secondary)]">Create high-quality QR codes with custom colors, sizes, error correction levels, and embedded logos.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">High Error Correction</h3>
                    <p className="text-[var(--fg-secondary)]">Supports up to 30% error correction, allowing you to embed logos or sustain damage while remaining scannable.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="QR Generator"
            filename="qrcode.png"
            defaultFilename="qrcode.png"
            extension="png"
            toolId="qr-generator"
            editorSlot={Controls}
            previewSlot={Preview}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(text); toast.success("Content copied!"); }}
            onDownload={() => downloadQR('png')}
        />
    );
}