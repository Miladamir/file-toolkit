"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    Upload,
    Download,
    Settings2,
    FileCode2,
    Sparkles,
    Minimize2,
    Eye
} from "lucide-react";

interface OptimizerSettings {
    removeMetadata: boolean;
    removeComments: boolean;
    removeEmptyGroups: boolean;
    minify: boolean;
}

export default function SvgOptimizerPage() {
    const [inputSvg, setInputSvg] = useState("");
    const [outputSvg, setOutputSvg] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [stats, setStats] = useState({ original: 0, optimized: 0, saved: 0 });

    const [settings, setSettings] = useState<OptimizerSettings>({
        removeMetadata: true,
        removeComments: true,
        removeEmptyGroups: true,
        minify: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Core Logic ---

    useEffect(() => {
        if (inputSvg) {
            const result = optimizeSvg(inputSvg, settings);
            setOutputSvg(result.code);

            // Create preview URL
            const blob = new Blob([result.code], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);

            // Calc stats
            const originalSize = new Blob([inputSvg]).size;
            const optimizedSize = new Blob([result.code]).size;
            const saved = originalSize > 0 ? ((originalSize - optimizedSize) / originalSize) * 100 : 0;
            setStats({
                original: originalSize,
                optimized: optimizedSize,
                saved: saved
            });

            // Cleanup
            return () => URL.revokeObjectURL(url);
        } else {
            setOutputSvg("");
            setPreviewUrl("");
            setStats({ original: 0, optimized: 0, saved: 0 });
        }
    }, [inputSvg, settings]);

    const optimizeSvg = (svgString: string, opts: OptimizerSettings): { code: string } => {
        if (!svgString.trim()) return { code: "" };

        let svg = svgString;
        const parser = new DOMParser();
        let doc;

        try {
            doc = parser.parseFromString(svg, "image/svg+xml");
            const errorNode = doc.querySelector("parsererror");
            if (errorNode) throw new Error("Invalid SVG format");
        } catch (e) {
            console.error(e);
            return { code: "// Error: Invalid SVG Input" };
        }

        const root = doc.documentElement;

        // 1. Structural Cleaning (DOM Manipulation)
        if (opts.removeComments) {
            const walker = doc.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
            const comments = [];
            while (walker.nextNode()) comments.push(walker.currentNode);
            comments.forEach(c => c.parentNode?.removeChild(c));
        }

        if (opts.removeMetadata) {
            // Remove <metadata>, <title>, <desc>
            const metaTags = root.querySelectorAll("metadata, title, desc");
            metaTags.forEach(tag => tag.remove());

            // Remove Editor specific nodes (Inkscape/Sodipodi)
            const editorNodes = root.querySelectorAll("[sodipodi\\:type], [inkscape\\:groupmode]");
            editorNodes.forEach(n => n.remove());
        }

        if (opts.removeEmptyGroups) {
            let changed = true;
            while (changed) {
                changed = false;
                const groups = root.querySelectorAll("g");
                groups.forEach(g => {
                    // Check if group has no children and no meaningful attributes (id, class are okay, but empty style is not)
                    // Simple check: no children
                    if (g.childNodes.length === 0) {
                        g.remove();
                        changed = true;
                    }
                });
            }
        }

        // Serialize back to string
        let result = new XMLSerializer().serializeToString(root);

        // 2. Regex Cleaning (String Manipulation)
        if (opts.removeMetadata) {
            // Remove editor namespace declarations
            result = result.replace(/\s(xmlns:sodipodi|xmlns:inkscape|xmlns:dc|xmlns:cc|xmlns:rdf)="[^"]*"/g, "");
            // Remove editor attributes
            result = result.replace(/\s(sodipodi:[a-z]+|inkscape:[a-z]+|data-name)="[^"]*"/g, "");
        }

        if (opts.minify) {
            // Remove whitespace between tags
            result = result.replace(/>\s+</g, "><");
            // Collapse multiple spaces to single space
            result = result.replace(/\s{2,}/g, " ");
            // Trim
            result = result.trim();
        }

        return { code: result };
    };

    // --- Handlers ---

    const handleFile = (file: File) => {
        if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
            toast.error("Please upload a valid SVG file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setInputSvg(e.target?.result as string);
        reader.readAsText(file);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const downloadSvg = () => {
        if (!outputSvg) return;
        const blob = new Blob([outputSvg], { type: "image/svg+xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "optimized.svg";
        link.click();
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Settings</span>
                    <Settings2 size={12} className="text-[var(--fg-secondary)]" />
                </div>

                <ToggleOption label="Remove Metadata" checked={settings.removeMetadata} onChange={(v) => setSettings(p => ({ ...p, removeMetadata: v }))} />
                <ToggleOption label="Remove Comments" checked={settings.removeComments} onChange={(v) => setSettings(p => ({ ...p, removeComments: v }))} />
                <ToggleOption label="Remove Empty Groups" checked={settings.removeEmptyGroups} onChange={(v) => setSettings(p => ({ ...p, removeEmptyGroups: v }))} />
                <ToggleOption label="Minify Output" checked={settings.minify} onChange={(v) => setSettings(p => ({ ...p, minify: v }))} />
            </div>

            <div className="flex-1 min-h-0" />

            <div className="border-t border-[var(--border)] pt-4 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Original</span> <span className="font-mono">{formatBytes(stats.original)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Optimized</span> <span className="font-mono text-purple-600">{formatBytes(stats.optimized)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-[var(--fg-secondary)]">Saved</span> <span className="font-mono text-green-600">{stats.saved.toFixed(1)}%</span></div>
            </div>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Original SVG</span>
                <FileCode2 size={12} />
            </div>

            <div className="flex-1 min-h-0 relative">
                {/* Drop Zone */}
                {!inputSvg && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                    >
                        <Upload size={32} className="text-purple-500 mb-2" />
                        <p className="text-sm font-medium text-[var(--fg)]">Drop SVG file here</p>
                        <p className="text-xs text-[var(--fg-secondary)]">or paste code below</p>
                    </div>
                )}

                <CodeMirrorEditor
                    language="xml"
                    value={inputSvg}
                    onChange={setInputSvg}
                />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-purple-50 dark:bg-purple-900/30 px-4 py-1 border-b border-purple-200 dark:border-purple-800 text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider flex justify-between">
                <span>Optimized Output</span>
                <span className="flex items-center gap-1"><Minimize2 size={10} /> {formatBytes(stats.optimized)}</span>
            </div>

            {/* Visual Preview */}
            <div className="h-1/2 border-b border-[var(--border)] bg-[var(--bg-secondary)] overflow-auto flex items-center justify-center relative">
                {previewUrl ? (
                    <img src={previewUrl} alt="SVG Preview" className="max-w-full max-h-full p-4 object-contain" />
                ) : (
                    <div className="text-center text-xs text-[var(--fg-secondary)] flex flex-col items-center gap-2">
                        <Eye size={24} className="opacity-20" />
                        Preview
                    </div>
                )}
            </div>

            {/* Code Output */}
            <div className="h-1/2 min-h-0 border-t border-[var(--border)] relative">
                <div className="absolute top-0 left-0 right-0 bottom-0">
                    <CodeMirrorEditor
                        language="xml"
                        value={outputSvg}
                        onChange={() => { }} // Read only
                    />
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">SVG Optimizer</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Clean Code</h3>
                    <p className="text-[var(--fg-secondary)]">Remove metadata, editor-specific namespaces (Inkscape, Illustrator), comments, and invisible elements.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Reduce Size</h3>
                    <p className="text-[var(--fg-secondary)]">Minify your SVGs by removing whitespace and unnecessary data, resulting in faster load times.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="SVG Optimizer"
            filename="optimized.svg"
            defaultFilename="optimized.svg"
            extension="svg"
            toolId="svg-optimizer"
            editorSlot={Controls}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(outputSvg); toast.success("SVG code copied!"); }}
            onDownload={downloadSvg}
        />
    );
}

// --- Helper Component ---
function ToggleOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-[var(--fg)] group-hover:text-purple-600 transition-colors">{label}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--border)] rounded-full peer-checked:bg-purple-600 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
            </div>
        </label>
    );
}