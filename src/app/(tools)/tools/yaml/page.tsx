"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import YamlTreePreview from "@/components/ui/YamlTreePreview";
import YAMLActions from "@/components/tools/YAMLActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";

export default function YamlToolPage() {
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
                        <div className="drop-title">Drop YAML file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".yaml,.yml" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="yaml" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online YAML Editor & Validator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Validation</h3>
                    <p className="text-[var(--fg-secondary)]">Catches indentation errors and syntax issues as you type. YAML is sensitive to formatting, and our editor helps you keep it clean.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Convert to JSON</h3>
                    <p className="text-[var(--fg-secondary)]">Transform your configuration to JSON format with one click. Useful for migrating configurations or debugging data structures.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="YAML Editor"
            filename={filename || "config.yaml"}
            defaultFilename="config.yaml"
            extension="yaml"
            toolId="yaml"
            toolbarSlot={<YAMLActions />}
            editorSlot={EditorContent}
            previewSlot={<YamlTreePreview />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/yaml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "config.yaml"; a.click();
            }}
        />
    );
}