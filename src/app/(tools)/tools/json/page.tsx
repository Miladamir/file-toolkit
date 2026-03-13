"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import JsonTreePreview from "@/components/ui/JsonTreePreview";
import JSONActions from "@/components/tools/JSONActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";

export default function JsonToolPage() {
    const { content, filename, setFileAuto, setContent } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showDropZone = !content || content.trim() === "";

    const handleDragEnter = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setFileAuto(file.name, e.target?.result as string);
        reader.readAsText(file);
    };

    const ToolbarActions = (
        <JSONActions />
    );

    const EditorContent = (
        <div
            className="relative w-full h-full"
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div
                        className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop JSON file here</div>
                        <div className="drop-subtitle">or click to browse</div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".json"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </div>
            )}
            <CodeMirrorEditor language="json" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">
                Online JSON Formatter & Validator
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Key Features</h3>
                    <ul className="list-disc list-inside text-[var(--fg-secondary)] space-y-2">
                        <li><strong>Instant Formatting:</strong> Beautify JSON with proper indentation.</li>
                        <li><strong>Visual Tree View:</strong> Collapsible tree structure to navigate large objects.</li>
                        <li><strong>Error Detection:</strong> Immediate feedback on syntax errors.</li>
                        <li><strong>Minification:</strong> Compress JSON for production use.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">What is JSON?</h3>
                    <p className="text-[var(--fg-secondary)] leading-relaxed">
                        JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate. It is the standard format for APIs and configuration files.
                    </p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="JSON Formatter"
            filename={filename || "untitled.json"}
            defaultFilename="untitled.json"
            extension="json"
            toolId="json" // Unique ID for state isolation
            toolbarSlot={ToolbarActions}
            editorSlot={EditorContent}
            previewSlot={<JsonTreePreview />}
            seoContent={SeoContent}
            onCopy={() => {
                navigator.clipboard.writeText(content);
                toast.success("Copied!");
            }}
            onDownload={() => {
                const blob = new Blob([content], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename || "untitled.json";
                a.click();
            }}
        />
    );
}