"use client";

import { useRef, useState, DragEvent, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import JsConsole, { LogEntry } from "@/components/ui/JsConsole";
import JSActions from "@/components/tools/JSActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";

export default function JavascriptToolPage() {
    const { content, filename, setFileAuto } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

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

    // --- Execution Logic ---
    const runCode = useCallback(() => {
        if (!content) return;

        const newLogs: LogEntry[] = [];
        const timestamp = Date.now();

        // Hijack console
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        const createLogFn = (type: LogEntry['type']) => (...args: any[]) => {
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            newLogs.push({ id: `${timestamp}-${Math.random()}`, type, message });
        };

        console.log = createLogFn('log');
        console.error = createLogFn('error');
        console.warn = createLogFn('warn');
        console.info = createLogFn('info');

        try {
            // Execute code
            // Using Function constructor is slightly safer than direct eval but still runs in same thread
            new Function(content)();

            // If no logs and successful, maybe add a success message? 
            // The HTML prototype does: "Script finished (no output)" handled by console component logic.
        } catch (e: any) {
            newLogs.push({
                id: `${timestamp}-err`,
                type: 'error',
                message: `Uncaught ${e.name}: ${e.message}`
            });
        } finally {
            // Restore console
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.info = originalConsole.info;

            setLogs(newLogs);
        }
    }, [content]);

    const clearConsole = () => setLogs([]);

    // --- Slots ---
    const ToolbarActions = <JSActions onRun={runCode} />;

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
                        <div className="drop-title">Drop JS file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".js" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="javascript" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online JavaScript Editor & Console</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Execution</h3>
                    <p className="text-[var(--fg-secondary)]">Write JavaScript code and run it instantly in your browser. View console outputs, debug logic, and test snippets without opening a terminal.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Safe Sandbox</h3>
                    <p className="text-[var(--fg-secondary)]">Code runs entirely within your browser's secure context. No server-side execution ensures your scripts remain private and local to your machine.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="JavaScript Editor"
            filename={filename || "script.js"}
            defaultFilename="script.js"
            extension="js"
            toolId="javascript"
            toolbarSlot={ToolbarActions}
            editorSlot={EditorContent}
            previewSlot={<JsConsole logs={logs} onClear={clearConsole} />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/javascript" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "script.js"; a.click();
            }}
        />
    );
}