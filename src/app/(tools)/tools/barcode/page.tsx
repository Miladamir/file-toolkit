"use client";

import { useState, useEffect, useRef } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import JsBarcode from "jsbarcode";
import { toast } from "sonner";
import { Download, AlertCircle, Info } from "lucide-react";

// Types for the configuration
interface BarcodeConfig {
    format: string;
    text: string;
    lineColor: string;
    background: string;
    width: number;
    height: number;
    fontSize: number;
    margin: number;
}

// Helper for format descriptions
const formatInfo: Record<string, string> = {
    'CODE128': 'Alphanumeric data. Most common for general use.',
    'EAN13': '13 digits. Standard retail product barcode.',
    'EAN8': '8 digits. For small retail items.',
    'UPC': '12 digits. Standard US/Canada retail.',
    'ITF14': '14 digits. Used for shipping containers.',
    'pharmacode': 'Numbers 3-131070. Used in pharmaceuticals.',
};

export default function BarcodeGeneratorPage() {
    const svgRef = useRef<SVGSVGElement>(null);

    // Default configuration
    const [config, setConfig] = useState<BarcodeConfig>({
        format: "CODE128",
        text: "ToolKit Pro",
        lineColor: "#000000",
        background: "#ffffff",
        width: 2,
        height: 100,
        fontSize: 16,
        margin: 10
    });

    const [error, setError] = useState<string | null>(null);

    // Generate Barcode on config change
    useEffect(() => {
        if (!svgRef.current) return;

        if (!config.text) {
            setError(null);
            return;
        }

        try {
            JsBarcode(svgRef.current, config.text, {
                format: config.format,
                width: config.width,
                height: config.height,
                lineColor: config.lineColor,
                background: config.background,
                fontSize: config.fontSize,
                margin: config.margin,
                font: "JetBrains Mono"
            });
            setError(null);
        } catch (e: any) {
            setError(e.message || "Invalid input for this format.");
        }
    }, [config]);

    const updateConfig = (updates: Partial<BarcodeConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const downloadSVG = () => {
        if (!svgRef.current) return;

        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `barcode-${config.text.substring(0, 10)}.svg`;
        link.click();

        URL.revokeObjectURL(url);
        toast.success("Barcode downloaded!");
    };

    // --- Sub Components ---

    const Controls = (
        <div className="p-6 space-y-6 h-full overflow-auto">
            {/* Format Select */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Format</label>
                <select
                    value={config.format}
                    onChange={(e) => updateConfig({ format: e.target.value })}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                    <option value="CODE128">CODE128 (General)</option>
                    <option value="EAN13">EAN-13 (Retail)</option>
                    <option value="EAN8">EAN-8 (Small Retail)</option>
                    <option value="UPC">UPC-A (US Retail)</option>
                    <option value="ITF14">ITF-14 (Shipping)</option>
                    <option value="pharmacode">Pharmacode</option>
                </select>
                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{formatInfo[config.format]}</span>
                </div>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Content</label>
                <input
                    type="text"
                    value={config.text}
                    onChange={(e) => updateConfig({ text: e.target.value })}
                    className={`w-full bg-[var(--bg-secondary)] border rounded-lg px-3 py-2 text-sm font-mono outline-none ${error ? 'border-red-500' : 'border-[var(--border)]'}`}
                    placeholder="Enter data..."
                />
                {error && (
                    <div className="flex items-center gap-2 text-xs text-red-500 pt-1">
                        <AlertCircle size={12} /> {error}
                    </div>
                )}
            </div>

            {/* Style Customization */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Appearance</label>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded border border-[var(--border)] bg-[var(--bg)]">
                        <input type="color" value={config.lineColor} onChange={(e) => updateConfig({ lineColor: e.target.value })} className="w-6 h-6 cursor-pointer" />
                        <span className="text-xs font-mono">{config.lineColor}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded border border-[var(--border)] bg-[var(--bg)]">
                        <input type="color" value={config.background} onChange={(e) => updateConfig({ background: e.target.value })} className="w-6 h-6 cursor-pointer" />
                        <span className="text-xs font-mono">{config.background}</span>
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--fg-secondary)]">Bar Width</span>
                        <input type="range" min="1" max="4" step="0.5" value={config.width} onChange={(e) => updateConfig({ width: +e.target.value })} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--fg-secondary)]">Height</span>
                        <input type="range" min="40" max="150" value={config.height} onChange={(e) => updateConfig({ height: +e.target.value })} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--fg-secondary)]">Font Size</span>
                        <input type="range" min="10" max="24" value={config.fontSize} onChange={(e) => updateConfig({ fontSize: +e.target.value })} className="w-24" />
                    </div>
                </div>
            </div>
        </div>
    );

    const Preview = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                {config.text && !error ? (
                    <div
                        className="shadow-lg rounded-lg p-4 overflow-auto"
                        style={{ backgroundColor: config.background }}
                    >
                        <svg ref={svgRef}></svg>
                    </div>
                ) : (
                    <div className="text-center text-[var(--fg-secondary)]">
                        <p>Enter valid data to generate barcode</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
                <button
                    onClick={downloadSVG}
                    disabled={!config.text || !!error}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--fg)] text-[var(--bg)] py-2.5 rounded-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                    <Download size={16} /> Download SVG
                </button>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Barcode Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Multi-Format Support</h3>
                    <p className="text-[var(--fg-secondary)]">Generate CODE128, EAN, UPC, and ITF barcodes. Select the format that matches your industry standard.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Scalable SVG Output</h3>
                    <p className="text-[var(--fg-secondary)]">Download vector SVG files that scale perfectly for any print size without pixelation.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Barcode Generator"
            filename="barcode.svg"
            defaultFilename="barcode.svg"
            extension="svg"
            toolId="barcode"
            editorSlot={Controls}
            previewSlot={Preview}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(config.text); toast.success("Content copied!"); }}
            onDownload={downloadSVG}
        />
    );
}