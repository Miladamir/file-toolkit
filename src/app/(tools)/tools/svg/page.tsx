"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import SvgPreview from "@/components/ui/SvgPreview";
import SVGActions from "@/components/tools/SVGActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Monitor, Sun, Moon } from "lucide-react";

export default function SvgToolPage() {
    const { content, filename, setFileAuto } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for background toggle
    const [bgMode, setBgMode] = useState<"trans" | "white" | "dark">("trans");

    const showDropZone = !content || content.trim() === "";

    const handleDragEnter = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setFileAuto(file.name, e.target?.result as string);
        reader.readAsText(file);
    };

    // Background Toggle Controls (passed to Layout Header)
    const PreviewControls = (
        <div className="flex items-center gap-1 border-l border-[var(--border)] pl-2 ml-2">
            <button
                onClick={() => setBgMode("trans")}
                className={`p-1.5 rounded ${bgMode === 'trans' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)] text-[var(--fg-secondary)]'}`}
                title="Transparency"
            >
                <Monitor size={16} />
            </button>
            <button
                onClick={() => setBgMode("white")}
                className={`p-1.5 rounded ${bgMode === 'white' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)] text-[var(--fg-secondary)]'}`}
                title="White Background"
            >
                <Sun size={16} />
            </button>
            <button
                onClick={() => setBgMode("dark")}
                className={`p-1.5 rounded ${bgMode === 'dark' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'hover:bg-[var(--bg-secondary)] text-[var(--fg-secondary)]'}`}
                title="Dark Background"
            >
                <Moon size={16} />
            </button>
        </div>
    );

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop SVG file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".svg,.xml" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="xml" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online SVG Editor & Viewer</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Live Preview</h3>
                    <p className="text-[var(--fg-secondary)]">Edit SVG source code and see the rendered vector graphics instantly. Switch between transparency, white, and dark backgrounds to check your artwork.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Optimization</h3>
                    <p className="text-[var(--fg-secondary)]">Use the Format tool to beautify code for editing, or Minify to reduce file size for production deployment.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="SVG Editor"
            filename={filename || "image.svg"}
            defaultFilename="image.svg"
            extension="svg"
            toolId="svg"
            toolbarSlot={<SVGActions />}
            editorSlot={EditorContent}
            previewSlot={<SvgPreview content={content} background={bgMode} />}
            previewControls={PreviewControls}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "image.svg"; a.click();
            }}
        />
    );
}