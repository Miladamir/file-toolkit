"use client";

import { useState, useMemo, useRef } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    Plus,
    Trash2,
    Download,
    Copy,
    Code,
    Settings2,
    Palette,
    Grid3X3,
    MoveHorizontal
} from "lucide-react";

interface ColorStop {
    id: string;
    color: string;
    position: number;
}

const PRESETS: ColorStop[][] = [
    [{ id: "0", color: "#ff00cc", position: 0 }, { id: "1", color: "#333399", position: 100 }],
    [{ id: "0", color: "#f093fb", position: 0 }, { id: "1", color: "#f5576c", position: 100 }],
    [{ id: "0", color: "#4facfe", position: 0 }, { id: "1", color: "#00f2fe", position: 100 }],
    [{ id: "0", color: "#43e97b", position: 0 }, { id: "1", color: "#38f9d7", position: 100 }],
    [{ id: "0", color: "#fa709a", position: 0 }, { id: "1", color: "#fee140", position: 100 }],
    [{ id: "0", color: "#a8edea", position: 0 }, { id: "1", color: "#fed6e3", position: 100 }],
    [{ id: "0", color: "#ff9a9e", position: 0 }, { id: "1", color: "#fecfef", position: 100 }],
    [{ id: "0", color: "#667eea", position: 0 }, { id: "1", color: "#764ba2", position: 100 }],
];

export default function CssGradientPage() {
    const [type, setType] = useState<"linear" | "radial">("linear");
    const [angle, setAngle] = useState(90);
    const [stops, setStops] = useState<ColorStop[]>(PRESETS[0]);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- CSS Generation ---

    const cssCode = useMemo(() => {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(", ");

        if (type === "linear") {
            return `background: linear-gradient(${angle}deg, ${stopsStr});`;
        } else {
            return `background: radial-gradient(circle at center, ${stopsStr});`;
        }
    }, [type, angle, stops]);

    // --- Handlers ---

    const addStop = () => {
        const newStop: ColorStop = {
            id: Math.random().toString(36).substr(2, 9),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            position: 50
        };
        setStops(prev => [...prev, newStop]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) {
            toast.error("Minimum 2 stops required.");
            return;
        }
        setStops(prev => prev.filter(s => s.id !== id));
    };

    const updateStop = (id: string, key: keyof ColorStop, value: string | number) => {
        setStops(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
    };

    const applyPreset = (preset: ColorStop[]) => {
        setStops(preset);
    };

    const copyCSS = () => {
        navigator.clipboard.writeText(cssCode);
        toast.success("CSS copied to clipboard!");
    };

    // --- Download Logic ---

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = 1920;
        const height = 1080;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let gradient: CanvasGradient;

        if (type === "linear") {
            // Convert CSS angle to Canvas coordinates
            // CSS 0deg is Top, Canvas 0 is Right. 
            // Formula: angleRad = (90 - angle) * PI / 180
            const angleRad = (90 - angle) * Math.PI / 180;

            // Diagonal length to ensure coverage
            const diagonal = Math.sqrt(width * width + height * height) / 2;
            const cx = width / 2;
            const cy = height / 2;

            gradient = ctx.createLinearGradient(
                cx - Math.cos(angleRad) * diagonal,
                cy - Math.sin(angleRad) * diagonal,
                cx + Math.cos(angleRad) * diagonal,
                cy + Math.sin(angleRad) * diagonal
            );
        } else {
            gradient = ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );
        }

        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        sortedStops.forEach(s => {
            gradient.addColorStop(s.position / 100, s.color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Trigger Download
        const link = document.createElement("a");
        link.download = "gradient.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            {/* Type Selection */}
            <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
                <button
                    onClick={() => setType("linear")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${type === "linear" ? "bg-purple-600 text-white" : "text-[var(--fg-secondary)] hover:bg-[var(--border)]"}`}
                >
                    Linear
                </button>
                <button
                    onClick={() => setType("radial")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${type === "radial" ? "bg-purple-600 text-white" : "text-[var(--fg-secondary)] hover:bg-[var(--border)]"}`}
                >
                    Radial
                </button>
            </div>

            {/* Angle (Linear only) */}
            {type === "linear" && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex justify-between">
                        <span>Angle</span>
                        <span className="font-mono text-purple-600">{angle}°</span>
                    </label>
                    <input
                        type="range"
                        min="0" max="360"
                        value={angle}
                        onChange={(e) => setAngle(+e.target.value)}
                        className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                </div>
            )}

            {/* Color Stops */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Color Stops</span>
                    <button onClick={addStop} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold">
                        <Plus size={14} /> Add Stop
                    </button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
                    {stops.map((stop) => (
                        <div key={stop.id} className="flex items-center gap-2 bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border)]">
                            <input
                                type="color"
                                value={stop.color}
                                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                            />
                            <input
                                type="range"
                                min="0" max="100"
                                value={stop.position}
                                onChange={(e) => updateStop(stop.id, "position", +e.target.value)}
                                className="flex-1 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <span className="text-[10px] font-mono text-[var(--fg-secondary)] w-8 text-right">{stop.position}%</span>
                            <button onClick={() => removeStop(stop.id)} className="text-red-400 hover:text-red-500 p-1 hover:bg-red-50 rounded">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]">
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Controls</span>
                <Settings2 size={12} />
            </div>
            {Controls}
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-1 border-b border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                Preview
            </div>

            {/* Gradient Preview */}
            <div className="flex-1 relative min-h-[200px]">
                <div
                    className="absolute inset-0"
                    style={{ background: cssCode.replace("background: ", "").slice(0, -1) }}
                ></div>
            </div>

            {/* Presets */}
            <div className="p-4 border-t border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1 mb-2"><Grid3X3 size={12} /> Presets</div>
                <div className="grid grid-cols-4 gap-2">
                    {PRESETS.map((preset, idx) => {
                        const stopsStr = preset.map(s => `${s.color} ${s.position}%`).join(", ");
                        const bg = `linear-gradient(135deg, ${stopsStr})`;
                        return (
                            <button
                                key={idx}
                                onClick={() => applyPreset(JSON.parse(JSON.stringify(preset)))}
                                className="aspect-square rounded border-2 border-transparent hover:border-purple-400 transition-colors"
                                style={{ background: bg }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* CSS Output */}
            <div className="p-4 border-t border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1"><Code size={12} /> CSS Code</span>
                    <button onClick={copyCSS} className="text-purple-600 hover:text-purple-700 font-semibold">Copy</button>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 font-mono text-xs text-[var(--fg)] overflow-x-auto">
                    {cssCode}
                </div>
            </div>

            {/* Hidden Canvas for Export */}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">CSS Gradient Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Visual Editor</h3>
                    <p className="text-[var(--fg-secondary)]">Create complex linear and radial gradients with unlimited color stops. Adjust angles and positions in real-time.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Export Options</h3>
                    <p className="text-[var(--fg-secondary)]">Copy the generated CSS directly or download a high-resolution 1920x1080 PNG of your gradient.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="CSS Gradient"
            filename="gradient.png"
            defaultFilename="gradient.png"
            extension="png"
            toolId="css-gradient"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyCSS}
            onDownload={downloadImage}
        />
    );
}