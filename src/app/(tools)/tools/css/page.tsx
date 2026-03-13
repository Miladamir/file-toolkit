"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import CssPreview from "@/components/ui/CssPreview"; // Import the preview
import CSSActions from "@/components/tools/CSSActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";

export default function CssToolPage() {
    const { content, filename, setFileAuto } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop CSS file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".css" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="css" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online CSS Editor with Live Preview</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Prototyping</h3>
                    <p className="text-[var(--fg-secondary)]">Test your CSS styles instantly. Write CSS on the left and see the changes applied to a sample HTML template in real-time on the right.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Ready Snippets</h3>
                    <p className="text-[var(--fg-secondary)]">Quick insert buttons for Flexbox, Grid layouts, Media Queries, and Animations.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="CSS Editor"
            filename={filename || "style.css"}
            defaultFilename="style.css"
            extension="css"
            toolId="css"
            toolbarSlot={<CSSActions />}
            editorSlot={EditorContent}
            previewSlot={<CssPreview />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/css" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "style.css"; a.click();
            }}
        />
    );
}