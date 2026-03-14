"use client";

import { useRef, useState, DragEvent, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import TextActions from "@/components/tools/TextActions";
import TextStats from "@/components/ui/TextStats";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Search } from "lucide-react";

export default function TextToolPage() {
    const { content, filename, setFileAuto } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // View State
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [wordWrap, setWordWrap] = useState(true);

    // Stats State
    const [stats, setStats] = useState({ lines: 0, words: 0, chars: 0, cursorLine: 1, cursorCol: 1, selectedChars: 0 });

    const showDropZone = !content || content.trim() === "";

    // --- Drag & Drop ---
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

    // --- Handlers ---
    const handleFind = () => {
        // Trigger CodeMirror's search panel (Command/Ctrl+F behavior simulation)
        // Since we can't easily "press keys" programmatically for CM,
        // we rely on the user using standard Cmd+F, or the search UI we enabled in the top right.
        toast.info("Use Ctrl+F (Cmd+F on Mac) to open search.");
    };

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop text file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md,.text" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor
                language="markdown" // Markdown is a good baseline for text styling
                showLineNumbers={showLineNumbers}
                wordWrap={wordWrap}
                onStatsChange={setStats}
            />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Professional Text Editor</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Writer Friendly</h3>
                    <p className="text-[var(--fg-secondary)]">Designed for drafting text, notes, or prose. Features word count, character count, and comfortable reading layouts.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Distraction Free</h3>
                    <p className="text-[var(--fg-secondary)]">Toggle line numbers and word wrap to suit your writing style. Clean interface keeps you focused.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Text Editor"
            filename={filename || "untitled.txt"}
            defaultFilename="untitled.txt"
            extension="txt"
            toolId="text"
            toolbarSlot={
                <TextActions
                    showLineNumbers={showLineNumbers}
                    wordWrap={wordWrap}
                    onToggleNumbers={() => setShowLineNumbers(p => !p)}
                    onToggleWrap={() => setWordWrap(p => !p)}
                    onFind={handleFind}
                />
            }
            editorSlot={EditorContent}
            // We use extraActions in the header for quick copy/download, no preview needed for raw text
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "untitled.txt"; a.click();
            }}
            // Inject stats into the 'extraActions' or just below the editor? 
            // ToolPageLayout has an `extraActions` prop for the header, but stats are better at the bottom.
            // Since ToolPageLayout doesn't have a dedicated footer slot, we can put it in `previewSlot` if we wanted, 
            // OR we just modify ToolPageLayout... but wait, the current layout has a mobile tab bar at bottom.
            // Let's just put the stats in the `previewSlot` but style it absolute bottom? No, that's hacky.
            // Let's just omit preview for text editor and put stats in a custom footer inside editorSlot.
            previewSlot={
                <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)] bg-[var(--bg-secondary)] border-t border-[var(--border)]">
                    <span className="text-sm">Toggle 'Wrap' or 'Lines' using the toolbar.</span>
                </div>
            }
        />
    );
}