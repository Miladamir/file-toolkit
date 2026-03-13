"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor"; // Switched from SimpleTextarea
import MarkdownPreview from "@/components/ui/MarkdownPreview";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import {
    Type, Bold, Italic, Strikethrough, Quote, List, CheckSquare,
    Link2, Image, Code, HelpCircle
} from "lucide-react";

export default function MarkdownToolPage() {
    const { content, filename, setFileAuto, setContent } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Note: textareaRef is removed as CodeMirror manages its own state.

    // Dropzone Logic
    const showDropZone = !content || content.trim() === "";

    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setFileAuto(file.name, e.target?.result as string);
        reader.readAsText(file);
    };

    // Toolbar Action Helper
    // Updated to append to content since we don't have direct cursor access without a specific ref API
    const insertText = (before: string, after: string = "") => {
        const newContent = content + before + after;
        setContent(newContent);
        toast.success("Snippet inserted");
    };

    const ToolbarActions = (
        <>
            <div className="toolbar-group">
                <button className="tool-btn" title="Heading 1" onClick={() => insertText('# ', '')}><Type size={16} /></button>
            </div>
            <div className="toolbar-group">
                <button className="tool-btn" title="Bold" onClick={() => insertText('**', '**')}><Bold size={16} /></button>
                <button className="tool-btn" title="Italic" onClick={() => insertText('_', '_')}><Italic size={16} /></button>
                <button className="tool-btn" title="Strikethrough" onClick={() => insertText('~~', '~~')}><Strikethrough size={16} /></button>
            </div>
            <div className="toolbar-group">
                <button className="tool-btn" title="Quote" onClick={() => insertText('> ', '')}><Quote size={16} /></button>
                <button className="tool-btn" title="List" onClick={() => insertText('- ', '')}><List size={16} /></button>
                <button className="tool-btn" title="Task List" onClick={() => insertText('- [ ] ', '')}><CheckSquare size={16} /></button>
            </div>
            <div className="toolbar-group">
                <button className="tool-btn" title="Link" onClick={() => insertText('[', '](url)')}><Link2 size={16} /></button>
                <button className="tool-btn" title="Image" onClick={() => insertText('![alt](', 'url)')}><Image size={16} /></button>
                <button className="tool-btn" title="Code" onClick={() => insertText('`', '`')}><Code size={16} /></button>
            </div>
            <div className="toolbar-group">
                <button className="tool-btn" title="Help" style={{ color: 'var(--accent)' }}><HelpCircle size={16} /></button>
            </div>
        </>
    );

    const EditorContent = (
        <div
            className="relative w-full h-full"
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drop Zone Overlay */}
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div
                        className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop Markdown file here</div>
                        <div className="drop-subtitle">or click to browse</div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".md,.txt,.markdown"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </div>
            )}

            {/* Use CodeMirror with Markdown language */}
            <CodeMirrorEditor language="markdown" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">
                Free Online Markdown Editor
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Key Features</h3>
                    <ul className="list-disc list-inside text-[var(--fg-secondary)] space-y-2">
                        <li>Live Preview: See your formatted text as you type.</li>
                        <li>GFM Support: GitHub Flavored Markdown extensions.</li>
                        <li>Math Support: KaTeX integration for equations.</li>
                        <li>Export: Download your file as .md instantly.</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Why Use This Tool?</h3>
                    <p className="text-[var(--fg-secondary)] leading-relaxed">
                        Our Markdown Editor is designed for developers and writers who need a clean, fast, and private environment to write documentation. All processing happens in your browser.
                    </p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Markdown Editor"
            filename={filename || "untitled.md"}
            defaultFilename="untitled.md"
            extension="md"
            toolbarSlot={ToolbarActions}
            editorSlot={EditorContent}
            previewSlot={<MarkdownPreview />}
            seoContent={SeoContent}
            toolId="markdown"
            onCopy={() => {
                navigator.clipboard.writeText(content);
                toast.success("Copied!");
            }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename || "untitled.md";
                a.click();
            }}
        />
    );
}