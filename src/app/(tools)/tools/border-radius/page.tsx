"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import {
    Box,
    CornerUpLeft,
    CornerUpRight,
    CornerDownRight,
    CornerDownLeft,
    Settings2,
    Copy,
    Download,
    Lock,
    Unlock,
    Circle,
    Square
} from "lucide-react";

type Unit = "px" | "%";

interface RadiusValues {
    tl: number; // Top-Left
    tr: number; // Top-Right
    br: number; // Bottom-Right
    bl: number; // Bottom-Left
}

const PRESETS = {
    circle: { tl: 50, tr: 50, br: 50, bl: 50, unit: "%" as Unit },
    pill: { tl: 999, tr: 999, br: 999, bl: 999, unit: "px" as Unit },
    leaf: { tl: 0, tr: 50, br: 50, bl: 0, unit: "%" as Unit },
    blob: { tl: 30, tr: 70, br: 40, bl: 60, unit: "%" as Unit },
    card: { tl: 12, tr: 12, br: 12, bl: 12, unit: "px" as Unit },
};

export default function BorderRadiusPage() {
    const [radius, setRadius] = useState<RadiusValues>({ tl: 0, tr: 0, br: 0, bl: 0 });
    const [radiusY, setRadiusY] = useState<RadiusValues>({ tl: 0, tr: 0, br: 0, bl: 0 }); // For elliptical

    const [unit, setUnit] = useState<Unit>("px");
    const [boxSize, setBoxSize] = useState(200);
    const [elliptical, setElliptical] = useState(false);
    const [lockX, setLockX] = useState(false); // Link all X corners

    // --- CSS Generation ---

    const cssCode = useMemo(() => {
        const { tl, tr, br, bl } = radius;
        const { tl: tlY, tr: trY, br: brY, bl: blY } = radiusY;

        // If elliptical is off, just use standard syntax
        if (!elliptical) {
            // Optimization: if all equal
            if (tl === tr && tr === br && br === bl) {
                return `border-radius: ${tl}${unit};`;
            }
            return `border-radius: ${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit};`;
        }

        // Elliptical syntax: horizontal / vertical
        const hStr = `${tl}${unit} ${tr}${unit} ${br}${unit} ${bl}${unit}`;
        const vStr = `${tlY}${unit} ${trY}${unit} ${brY}${unit} ${blY}${unit}`;

        return `border-radius: ${hStr} / ${vStr};`;
    }, [radius, radiusY, unit, elliptical]);

    const tailwindCode = useMemo(() => {
        // Extract value from CSS code for Tailwind arbitrary value
        const value = cssCode.replace("border-radius: ", "").replace(";", "");
        return `rounded-[${value}]`;
    }, [cssCode]);

    // --- Handlers ---

    const updateRadius = (key: keyof RadiusValues, value: number, isY: boolean = false) => {
        const setter = isY ? setRadiusY : setRadius;
        const state = isY ? radiusY : radius;

        if (lockX && !isY) {
            // Update all corners if locked
            setter({ tl: value, tr: value, br: value, bl: value });
        } else {
            setter({ ...state, [key]: value });
        }
    };

    const applyPreset = (name: keyof typeof PRESETS) => {
        const preset = PRESETS[name];
        setUnit(preset.unit);
        setRadius({ tl: preset.tl, tr: preset.tr, br: preset.br, bl: preset.bl });
        setRadiusY({ tl: 0, tr: 0, br: 0, bl: 0 });
        setElliptical(false);
    };

    const copyCSS = () => {
        navigator.clipboard.writeText(cssCode);
        toast.success("CSS copied!");
    };

    const downloadCSS = () => {
        const blob = new Blob([cssCode], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "border-radius.css";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center gap-2 h-full">
            <button
                onClick={() => { setRadius({ tl: 0, tr: 0, br: 0, bl: 0 }); setRadiusY({ tl: 0, tr: 0, br: 0, bl: 0 }); }}
                className="text-xs text-[var(--fg-secondary)] hover:text-[var(--fg)] flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--bg-secondary)]"
            >
                <RefreshCcw size={12} /> Reset
            </button>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">
            <div className="p-6 flex flex-col gap-6">

                {/* Unit Toggle */}
                <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1">
                    <button
                        onClick={() => setUnit("px")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${unit === "px" ? "bg-pink-600 text-white" : "text-[var(--fg-secondary)]"}`}
                    >
                        Pixels (px)
                    </button>
                    <button
                        onClick={() => setUnit("%")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${unit === "%" ? "bg-pink-600 text-white" : "text-[var(--fg-secondary)]"}`}
                    >
                        Percent (%)
                    </button>
                </div>

                {/* Horizontal Radius */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Horizontal Radius</h3>
                        <button
                            onClick={() => setLockX(!lockX)}
                            className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded ${lockX ? "bg-pink-100 text-pink-600" : "text-[var(--fg-secondary)]"}`}
                        >
                            {lockX ? <Lock size={10} /> : <Unlock size={10} />}
                            {lockX ? "Linked" : "Unlinked"}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SliderInput label="Top Left" icon={<CornerUpLeft size={10} />} value={radius.tl} unit={unit} onChange={(v) => updateRadius('tl', v)} />
                        <SliderInput label="Top Right" icon={<CornerUpRight size={10} />} value={radius.tr} unit={unit} onChange={(v) => updateRadius('tr', v)} />
                        <SliderInput label="Bottom Left" icon={<CornerDownLeft size={10} />} value={radius.bl} unit={unit} onChange={(v) => updateRadius('bl', v)} />
                        <SliderInput label="Bottom Right" icon={<CornerDownRight size={10} />} value={radius.br} unit={unit} onChange={(v) => updateRadius('br', v)} />
                    </div>
                </div>

                {/* Elliptical Toggle */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Elliptical Corners</span>
                        <div className="relative">
                            <input type="checkbox" checked={elliptical} onChange={(e) => setElliptical(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-[var(--border)] rounded-full peer-checked:bg-pink-600 transition-colors"></div>
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                    </label>

                    {elliptical && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <SliderInput label="Y Top Left" value={radiusY.tl} unit={unit} onChange={(v) => updateRadius('tl', v, true)} />
                            <SliderInput label="Y Top Right" value={radiusY.tr} unit={unit} onChange={(v) => updateRadius('tr', v, true)} />
                            <SliderInput label="Y Bottom Left" value={radiusY.bl} unit={unit} onChange={(v) => updateRadius('bl', v, true)} />
                            <SliderInput label="Y Bottom Right" value={radiusY.br} unit={unit} onChange={(v) => updateRadius('br', v, true)} />
                        </div>
                    )}
                </div>

                {/* Presets */}
                <div className="pt-4 border-t border-[var(--border)]">
                    <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-2">Presets</h3>
                    <div className="grid grid-cols-5 gap-2">
                        <button onClick={() => applyPreset('circle')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-semibold hover:border-pink-400 transition-colors">Circle</button>
                        <button onClick={() => applyPreset('pill')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-semibold hover:border-pink-400 transition-colors">Pill</button>
                        <button onClick={() => applyPreset('leaf')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-semibold hover:border-pink-400 transition-colors">Leaf</button>
                        <button onClick={() => applyPreset('blob')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-semibold hover:border-pink-400 transition-colors">Blob</button>
                        <button onClick={() => applyPreset('card')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[10px] font-semibold hover:border-pink-400 transition-colors">Card</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">
            <div className="bg-pink-50 dark:bg-pink-900/30 px-4 py-1 border-b border-pink-200 dark:border-pink-800 text-[10px] font-bold text-pink-600 dark:text-pink-300 uppercase tracking-wider flex justify-between">
                <span>Preview</span>
                <div className="flex items-center gap-2 text-[var(--fg-secondary)]">
                    <span className="text-[9px]">Size:</span>
                    <input
                        type="range"
                        min="50" max="300"
                        value={boxSize}
                        onChange={(e) => setBoxSize(+e.target.value)}
                        className="w-16 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                </div>
            </div>

            {/* Visual Preview */}
            <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)] bg-[url('/checkerboard.svg')]">
                <div
                    className="bg-gradient-to-br from-pink-500 to-rose-500 transition-all duration-200"
                    style={{
                        width: `${boxSize}px`,
                        height: `${boxSize}px`,
                        borderRadius: cssCode.replace('border-radius: ', '').replace(';', '')
                    }}
                />
            </div>

            {/* Code Output */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1 mb-2"><Settings2 size={12} /> CSS Code</div>
                <div className="h-16 rounded border border-[var(--border)] overflow-hidden bg-[var(--bg)]">
                    <CodeMirrorEditor
                        language="css"
                        value={cssCode}
                        onChange={() => { }}
                    />
                </div>
                <button onClick={copyCSS} className="w-full mt-2 py-2 bg-pink-600 text-white rounded text-xs font-bold hover:bg-pink-700 transition-colors">
                    Copy CSS
                </button>

                <div className="mt-4 text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1 mb-2">Tailwind Class</div>
                <div className="bg-[var(--bg-secondary)] rounded p-2 font-mono text-[11px] border border-[var(--border)] text-[var(--fg)] break-all">
                    {tailwindCode}
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Border Radius Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Complex Shapes</h3>
                    <p className="text-[var(--fg-secondary)]">Create standard rounded corners or complex elliptical shapes for blobs and organic designs.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Code</h3>
                    <p className="text-[var(--fg-secondary)]">Get standard CSS and Tailwind arbitrary values instantly. Supports pixel and percentage units.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Border Radius"
            filename="border-radius.css"
            defaultFilename="border-radius.css"
            extension="css"
            toolId="border-radius"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyCSS}
            onDownload={downloadCSS}
        />
    );
}

// --- Helper Component ---
function SliderInput({ label, icon, value, unit, onChange }: { label: string; icon?: React.ReactNode; value: number; unit: Unit; onChange: (val: number) => void }) {
    const max = unit === '%' ? 100 : 200;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[var(--fg-secondary)]">
                <div className="flex items-center gap-1">{icon} {label}</div>
                <span className="font-mono text-[var(--fg)]">{value}{unit}</span>
            </div>
            <input
                type="range"
                min="0"
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
        </div>
    );
}

// Icon refresh fix import
