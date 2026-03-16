"use client";

import { useState, useMemo, useEffect } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    Layers,
    Plus,
    Trash2,
    Settings2,
    Move,
    Maximize,
    Circle,
    Palette,
    Lock,
    Copy,
    Download,
    Square
} from "lucide-react";

interface ShadowLayer {
    id: string;
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string; // Hex
    opacity: number; // 0-1
    inset: boolean;
}

const PRESETS: Record<string, ShadowLayer[]> = {
    "Subtle": [{ id: "0", x: 0, y: 1, blur: 3, spread: 0, color: "#000000", opacity: 0.1, inset: false }],
    "Medium": [{ id: "0", x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 0.1, inset: false }],
    "Material": [{ id: "0", x: 0, y: 2, blur: 4, spread: 0, color: "#000000", opacity: 0.1, inset: false }, { id: "1", x: 0, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 0.1, inset: false }],
    "Sharp": [{ id: "0", x: 6, y: 6, blur: 0, spread: 0, color: "#000000", opacity: 0.15, inset: false }],
    "Dreamy": [{ id: "0", x: 0, y: 8, blur: 24, spread: 0, color: "#6366f1", opacity: 0.3, inset: false }],
    "Inset": [{ id: "0", x: 2, y: 2, blur: 5, spread: 0, color: "#000000", opacity: 0.3, inset: true }],
};

export default function BoxShadowPage() {
    const [layers, setLayers] = useState<ShadowLayer[]>([]);
    const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState("#f8f9fb");

    // Initialize with default
    useEffect(() => {
        applyPreset("Material");
    }, []);

    // --- Helpers ---

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    };

    // --- CSS Generation ---

    const cssCode = useMemo(() => {
        if (layers.length === 0) return "box-shadow: none;";

        const shadowStrings = layers.map(l => {
            const color = hexToRgba(l.color, l.opacity);
            return `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${color}`;
        });

        return `box-shadow: ${shadowStrings.join(', ')};`;
    }, [layers]);

    // --- Handlers ---

    const addLayer = () => {
        const newLayer: ShadowLayer = {
            id: generateId(),
            x: 0, y: 5, blur: 10, spread: 0,
            color: "#000000",
            opacity: 0.2,
            inset: false
        };
        setLayers(prev => [...prev, newLayer]);
        setActiveLayerId(newLayer.id);
    };

    const removeLayer = (id: string) => {
        if (layers.length <= 1) {
            toast.error("At least one layer is required.");
            return;
        }
        setLayers(prev => prev.filter(l => l.id !== id));
        if (activeLayerId === id) setActiveLayerId(layers[0]?.id || null);
    };

    const updateLayer = (id: string, key: keyof ShadowLayer, value: string | number | boolean) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, [key]: value } : l));
    };

    const applyPreset = (name: string) => {
        const preset = PRESETS[name];
        if (preset) {
            // Deep copy with new IDs
            const newLayers = preset.map(l => ({ ...l, id: generateId() }));
            setLayers(newLayers);
            setActiveLayerId(newLayers[0]?.id || null);
        }
    };

    const copyCSS = () => {
        navigator.clipboard.writeText(cssCode);
        toast.success("CSS copied to clipboard!");
    };

    const downloadCSS = () => {
        const blob = new Blob([cssCode], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "box-shadow.css";
        a.click();
        URL.revokeObjectURL(url);
    };

    // Active Layer
    const activeLayer = layers.find(l => l.id === activeLayerId);

    // --- UI Slots ---

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] overflow-auto">
            {/* Layer List Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg)] flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Layers ({layers.length})</h3>
                <button onClick={addLayer} className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-semibold">
                    <Plus size={14} /> Add Layer
                </button>
            </div>

            {/* Layer List */}
            <div className="p-2 space-y-1">
                {layers.map(layer => (
                    <div
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${layer.id === activeLayerId ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-[var(--bg)] border-[var(--border)] hover:border-blue-300'}`}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-sm border border-[var(--border)]"
                                    style={{ background: layer.color, opacity: layer.opacity + 0.3 }}
                                />
                                <span className="text-sm font-medium">
                                    {layer.inset ? "Inset" : "Outset"}
                                </span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                                className="p-1 hover:bg-red-50 hover:text-red-500 rounded"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Layer Controls */}
            {activeLayer && (
                <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)] mt-auto">
                    <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-4">Layer Properties</h3>

                    <div className="space-y-4">
                        {/* X Offset */}
                        <InputRow
                            label="X Offset" icon={<Move size={12} />}
                            value={activeLayer.x} min="-100" max="100"
                            onChange={(v) => updateLayer(activeLayer.id, 'x', v)}
                        />
                        {/* Y Offset */}
                        <InputRow
                            label="Y Offset" icon={<Move size={12} className="rotate-90" />}
                            value={activeLayer.y} min="-100" max="100"
                            onChange={(v) => updateLayer(activeLayer.id, 'y', v)}
                        />
                        {/* Blur */}
                        <InputRow
                            label="Blur" icon={<Circle size={12} />}
                            value={activeLayer.blur} min="0" max="150"
                            onChange={(v) => updateLayer(activeLayer.id, 'blur', v)}
                        />
                        {/* Spread */}
                        <InputRow
                            label="Spread" icon={<Maximize size={12} />}
                            value={activeLayer.spread} min="-50" max="50"
                            onChange={(v) => updateLayer(activeLayer.id, 'spread', v)}
                        />
                        {/* Opacity */}
                        <InputRow
                            label="Opacity" icon={<Lock size={12} />}
                            value={activeLayer.opacity} min="0" max="1" step="0.01"
                            onChange={(v) => updateLayer(activeLayer.id, 'opacity', v)}
                        />

                        <div className="flex gap-4 items-center pt-2 border-t border-[var(--border)]">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-[var(--fg-secondary)]">Color</span>
                                <input
                                    type="color"
                                    value={activeLayer.color}
                                    onChange={(e) => updateLayer(activeLayer.id, 'color', e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-[var(--border)] bg-transparent"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activeLayer.inset}
                                    onChange={(e) => updateLayer(activeLayer.id, 'inset', e.target.checked)}
                                    className="accent-blue-600"
                                />
                                <span className="text-xs font-medium">Inset</span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1 border-b border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider flex justify-between items-center">
                <span>Preview</span>
                <div className="flex items-center gap-2 text-[var(--fg-secondary)]">
                    <span className="text-[9px]">BG:</span>
                    <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                    />
                </div>
            </div>

            {/* Preview Area */}
            <div
                className="flex-1 flex items-center justify-center p-8 overflow-auto transition-colors"
                style={{ backgroundColor: bgColor }}
            >
                <div
                    className="w-48 h-48 bg-white rounded-lg flex items-center justify-center transition-shadow duration-200"
                    style={{ boxShadow: cssCode.replace('box-shadow: ', '').replace(';', '') }}
                >
                    <Square size={48} className="text-gray-300" strokeWidth={1} />
                </div>
            </div>

            {/* Presets */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-2">Presets</div>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(PRESETS).map(name => (
                        <button
                            key={name}
                            onClick={() => applyPreset(name)}
                            className="px-2 py-1 text-xs font-medium border border-[var(--border)] rounded bg-[var(--bg)] hover:border-blue-400 transition-colors"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Output */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1"><Settings2 size={12} /> CSS Code</span>
                </div>
                <div className="h-24 rounded border border-[var(--border)] overflow-hidden bg-[var(--bg)]">
                    <CodeMirrorEditor
                        language="css"
                        value={cssCode}
                        onChange={() => { }}
                    />
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Box Shadow Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Layer Management</h3>
                    <p className="text-[var(--fg-secondary)]">Stack multiple shadows to create complex depth effects. Click a layer to edit its properties or delete it.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Live Preview</h3>
                    <p className="text-[var(--fg-secondary)]">Change the preview background color to test your shadow against different surfaces instantly.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Box Shadow"
            filename="box-shadow.css"
            defaultFilename="box-shadow.css"
            extension="css"
            toolId="box-shadow"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyCSS}
            onDownload={downloadCSS}
        />
    );
}

// --- Helper Component ---
function InputRow({ label, icon, value, min, max, step = "1", onChange }: { label: string; icon: React.ReactNode; value: number; min: string; max: string; step?: string; onChange: (val: number) => void }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[var(--fg-secondary)]">
                <div className="flex items-center gap-1">{icon} {label}</div>
                <span className="font-mono text-[var(--fg)]">{value}{label === 'Opacity' ? '' : 'px'}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>
    );
}