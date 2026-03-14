"use client";

import { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, getLuminance, ColorState } from "@/lib/colorUtils";
import { toast } from "sonner";
import { Shuffle } from "lucide-react";

// Initial State
const initialColor: ColorState = {
    hex: "#6366f1",
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 }
};

export default function ColorConverterPage() {
    const [color, setColor] = useState<ColorState>(initialColor);

    // --- Update Handlers ---

    // From HEX Input
    const updateFromHex = (hex: string) => {
        if (!hex.startsWith("#")) hex = "#" + hex;
        if (hex.length < 4) return; // Wait for typing

        const rgb = hexToRgb(hex);
        if (rgb) {
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            setColor({ hex, rgb, hsl });
        }
    };

    // From RGB Sliders
    const updateFromRgb = (newRgb: Partial<typeof color.rgb>) => {
        const rgb = { ...color.rgb, ...newRgb };
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        setColor({ hex, rgb, hsl });
    };

    // From HSL Sliders
    const updateFromHsl = (newHsl: Partial<typeof color.hsl>) => {
        const hsl = { ...color.hsl, ...newHsl };
        const rgb = hslToRgb(hsl.h / 360, hsl.s / 100, hsl.l / 100);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        setColor({ hex, rgb, hsl });
    };

    const randomColor = () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        updateFromRgb({ r, g, b });
    };

    // --- Sub Components ---

    const Controls = (
        <div className="p-6 space-y-6 h-full overflow-auto">
            {/* Picker & Hex */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Color Picker</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer border border-[var(--border)] overflow-hidden"
                    />
                    <input
                        type="text"
                        value={color.hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-md px-3 py-2 font-mono text-sm uppercase"
                    />
                </div>
            </div>

            {/* RGB Sliders */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">RGB</label>
                {(["r", "g", "b"] as const).map((key) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className={`w-4 text-sm font-bold ${key === 'r' ? 'text-red-500' : key === 'g' ? 'text-green-500' : 'text-blue-500'}`}>{key.toUpperCase()}</span>
                        <input
                            type="range" min="0" max="255" value={color.rgb[key]}
                            onChange={(e) => updateFromRgb({ [key]: +e.target.value })}
                            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ background: `linear-gradient(to right, #000, ${key === 'r' ? '#f00' : key === 'g' ? '#0f0' : '#00f'})` }}
                        />
                        <span className="w-8 text-xs text-right font-mono">{color.rgb[key]}</span>
                    </div>
                ))}
            </div>

            {/* HSL Sliders */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">HSL</label>
                <div className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-[var(--fg-secondary)]">H</span>
                    <input
                        type="range" min="0" max="360" value={color.hsl.h}
                        onChange={(e) => updateFromHsl({ h: +e.target.value })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
                    />
                    <span className="w-10 text-xs text-right font-mono">{color.hsl.h}°</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-[var(--fg-secondary)]">S</span>
                    <input
                        type="range" min="0" max="100" value={color.hsl.s}
                        onChange={(e) => updateFromHsl({ s: +e.target.value })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, hsl(${color.hsl.h}, 0%, 50%), hsl(${color.hsl.h}, 100%, 50%))` }}
                    />
                    <span className="w-10 text-xs text-right font-mono">{color.hsl.s}%</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-4 text-sm font-bold text-[var(--fg-secondary)]">L</span>
                    <input
                        type="range" min="0" max="100" value={color.hsl.l}
                        onChange={(e) => updateFromHsl({ l: +e.target.value })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{ background: `linear-gradient(to right, #000, hsl(${color.hsl.h}, ${color.hsl.s}%, 50%), #fff)` }}
                    />
                    <span className="w-10 text-xs text-right font-mono">{color.hsl.l}%</span>
                </div>
            </div>
        </div>
    );

    const Preview = (
        <div className="h-full flex flex-col bg-[var(--bg)] overflow-auto">
            {/* Main Swatch */}
            <div className="flex-1 min-h-[200px] flex items-center justify-center text-2xl font-bold border-b border-[var(--border)] transition-colors"
                style={{ backgroundColor: color.hex, color: getLuminance(color.rgb.r, color.rgb.g, color.rgb.b) > 0.5 ? '#000' : '#fff' }}
            >
                Aa
            </div>

            {/* Conversion List */}
            <div className="p-4 space-y-2 border-b border-[var(--border)]">
                <CopyRow label="HEX" value={color.hex.toUpperCase()} />
                <CopyRow label="RGB" value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} />
                <CopyRow label="HSL" value={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`} />
                <CopyRow label="CSS Var" value={`--color: ${color.hex};`} />
            </div>

            {/* Contrast Checker */}
            <div className="p-4 border-b border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider block mb-2">Contrast Check</label>
                <div className="grid grid-cols-2 gap-2 rounded overflow-hidden border border-[var(--border)]">
                    <div className="p-3 text-center text-sm font-medium" style={{ backgroundColor: color.hex, color: '#fff' }}>White</div>
                    <div className="p-3 text-center text-sm font-medium" style={{ backgroundColor: color.hex, color: '#000' }}>Black</div>
                </div>
            </div>

            {/* Palette */}
            <div className="p-4">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider block mb-2">Palette</label>
                <div className="flex h-12 rounded overflow-hidden border border-[var(--border)]">
                    {[15, 30, 50, 70, 90].map(l => (
                        <button
                            key={l}
                            className="flex-1 text-[10px] font-mono flex items-center justify-center"
                            style={{ backgroundColor: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${l}%)`, color: l > 50 ? '#000' : '#fff' }}
                            onClick={() => updateFromHsl({ l })}
                            title={`Lightness ${l}%`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online Color Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Multi-Format Support</h3>
                    <p className="text-[var(--fg-secondary)]">Convert colors between HEX, RGB, HSL, and CSS variables instantly. Adjust values precisely with visual sliders.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Design Tools</h3>
                    <p className="text-[var(--fg-secondary)]">Includes contrast checking for accessibility and a dynamic palette generator based on lightness.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Color Converter"
            filename="color.json"
            defaultFilename="color.json"
            extension="json"
            toolId="color"
            toolbarSlot={
                <button onClick={randomColor} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all">
                    <Shuffle size={14} /> Random
                </button>
            }
            editorSlot={Controls}
            previewSlot={Preview}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(JSON.stringify(color, null, 2)); toast.success("Color data copied!"); }}
            onDownload={() => {
                const blob = new Blob([JSON.stringify(color, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "color.json";
                a.click();
            }}
        />
    );
}

// Helper Component for Copy Rows
function CopyRow({ label, value }: { label: string; value: string }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success(`${label} copied!`);
    };

    return (
        <div className="flex justify-between items-center py-1.5">
            <span className="text-sm font-medium text-[var(--fg-secondary)]">{label}</span>
            <button
                onClick={handleCopy}
                className="font-mono text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--fg)] hover:bg-[var(--accent-light)] transition-colors"
            >
                {value}
            </button>
        </div>
    );
}