"use client";

import { useRef, useState, DragEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import HtmlPreview from "@/components/ui/HtmlPreview";
import ToolButton from "@/components/ui/ToolButton";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { html as beautifyHtml } from "js-beautify";
import {
    FileCode, Type, Bold, Italic, Underline, List, Table,
    Link2, Image, TextCursor, Sparkles, Trash2, Play, Pause
} from "lucide-react";

export default function HtmlToolPage() {
    const { content, filename, setFileAuto, setContent, clearFile } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for Live Preview Toggle
    const [isLivePreview, setIsLivePreview] = useState(true);

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

    // --- Toolbar Logic ---
    const insertText = (before: string, after: string = "") => {
        const newContent = content + before + after;
        setContent(newContent);
        toast.success("Template inserted");
    };

    const insertBoilerplate = () => {
        if (content.trim() !== "" && !confirm("Replace current content with boilerplate?")) return;
        const boilerplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body { font-family: sans-serif; padding: 2rem; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
    <p>Start editing to see changes.</p>
</body>
</html>`;
        setContent(boilerplate);
        toast.success("Boilerplate inserted");
    };

    const insertTable = () => {
        const table = `<table border="1" style="border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </tbody>
</table>`;
        setContent(content + "\n" + table);
    };

    const handleBeautify = () => {
        if (!content) return;
        try {
            const beautified = beautifyHtml(content, {
                indent_size: 2,
            });
            setContent(beautified);
            toast.success("Code beautified!");
        } catch (e) {
            toast.error("Failed to beautify code");
        }
    };

    const ToolbarActions = (
        <>
            <div className="toolbar-group">
                <ToolButton onClick={insertBoilerplate} title="HTML5 Boilerplate">
                    <FileCode size={16} />
                </ToolButton>
            </div>

            <div className="toolbar-group">
                <ToolButton onClick={() => insertText('<div>', '</div>')} title="Div">div</ToolButton>
                <ToolButton onClick={() => insertText('<p>', '</p>')} title="Paragraph">p</ToolButton>
                <ToolButton onClick={() => insertText('<span>', '</span>')} title="Span">span</ToolButton>
                <ToolButton onClick={() => insertText('<h1>', '</h1>')} title="Heading">H1</ToolButton>
            </div>

            <div className="toolbar-group">
                <ToolButton onClick={() => insertText('<b>', '</b>')} title="Bold"><Bold size={16} /></ToolButton>
                <ToolButton onClick={() => insertText('<i>', '</i>')} title="Italic"><Italic size={16} /></ToolButton>
                <ToolButton onClick={() => insertText('<u>', '</u>')} title="Underline"><Underline size={16} /></ToolButton>
            </div>

            <div className="toolbar-group">
                <ToolButton onClick={() => insertText('<ul>\n  <li>', '</li>\n</ul>')} title="List"><List size={16} /></ToolButton>
                <ToolButton onClick={insertTable} title="Table"><Table size={16} /></ToolButton>
            </div>

            <div className="toolbar-group">
                <ToolButton onClick={() => insertText('<a href="#">', '</a>')} title="Link"><Link2 size={16} /></ToolButton>
                <ToolButton onClick={() => insertText('<img src="" alt="">', '')} title="Image"><Image size={16} /></ToolButton>
                <ToolButton onClick={() => insertText('<input type="text">', '')} title="Input"><TextCursor size={16} /></ToolButton>
            </div>

            <div className="toolbar-group">
                <ToolButton onClick={() => insertText('<!-- ', ' -->')} title="Comment">/*</ToolButton>
            </div>

            <div className="toolbar-group" style={{ border: "none" }}>
                <ToolButton onClick={handleBeautify} title="Beautify Code">
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                </ToolButton>
            </div>
        </>
    );

    // Preview Controls passed to Layout Header
    const PreviewControls = (
        <button
            className="tool-btn"
            title={isLivePreview ? "Pause Preview" : "Resume Preview"}
            onClick={() => setIsLivePreview(!isLivePreview)}
            style={{ color: isLivePreview ? 'var(--accent)' : 'var(--fg-secondary)' }}
        >
            {isLivePreview ? <Pause size={16} /> : <Play size={16} />}
        </button>
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
                        <div className="drop-title">Drop HTML file here</div>
                        <div className="drop-subtitle">or click to browse</div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".html,.htm"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </div>
            )}

            <CodeMirrorEditor language="html" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">
                Online HTML Editor with Live Preview
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Prototyping</h3>
                    <p className="text-[var(--fg-secondary)]">
                        Write HTML, CSS, and JavaScript in the editor and see the results instantly in the preview pane. Perfect for testing snippets or building landing pages.
                    </p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Code Beautification</h3>
                    <p className="text-[var(--fg-secondary)]">
                        Use the built-in beautify tool to clean up messy code instantly. Supports modern HTML5 standards.
                    </p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="HTML Editor"
            filename={filename || "index.html"}
            defaultFilename="index.html"
            extension="html"
            toolbarSlot={ToolbarActions}
            editorSlot={EditorContent}
            previewSlot={<HtmlPreview isLive={isLivePreview} />}
            seoContent={SeoContent}
            previewControls={PreviewControls}
            toolId="html"
            extraActions={
                <button className="btn-icon" onClick={() => { clearFile(); toast.info("Editor cleared"); }}>
                    <Trash2 size={16} />
                    <span>Clear</span>
                </button>
            }
            onCopy={() => {
                navigator.clipboard.writeText(content);
                toast.success("Copied!");
            }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename || "index.html";
                a.click();
            }}
        />
    );
}