"use client";

import { useRef, useState, DragEvent, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import PythonConsole, { LogLine } from "@/components/ui/PythonConsole";
import PythonActions from "@/components/tools/PythonActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";

export default function PythonToolPage() {
    const { content, filename, setFileAuto, setContent } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const showDropZone = !content || content.trim() === "";

    // --- Execution Logic via API ---
    const handleRun = useCallback(async () => {
        if (!content) return;

        setIsRunning(true);
        setLogs(prev => [...prev, { id: Date.now().toString(), type: "system", content: "Running..." }]);

        try {
            const res = await fetch("/api/run-python", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: content }),
            });

            const data = await res.json();

            setLogs([]); // Clear "Running..." message

            if (data.stdout) {
                data.stdout.split('\n').forEach((line: string) => {
                    if (line.trim() || data.stdout.includes('\n')) { // Preserve empty lines if multi-line
                        addLog(line, "stdout");
                    }
                });
            }

            if (data.stderr) {
                data.stderr.split('\n').forEach((line: string) => {
                    if (line.trim()) addLog(line, "stderr");
                });
            }

        } catch (err: any) {
            addLog("Failed to connect to execution server.", "stderr");
        } finally {
            setIsRunning(false);
        }
    }, [content]);

    const addLog = (content: string, type: LogLine["type"]) => {
        setLogs(prev => [...prev, { id: Math.random().toString(), content, type }]);
    };

    const handleClear = () => setLogs([]);

    const handleSnippet = (code: string) => {
        setContent(content + "\n" + code);
        toast.success("Snippet inserted");
    };

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

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <div className="drop-title">Drop Python file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".py" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="python" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online Python Editor & Compiler</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Server-Side Execution</h3>
                    <p className="text-[var(--fg-secondary)]">Run Python scripts on a real backend environment. Fast, lightweight, and supports standard libraries.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Feedback</h3>
                    <p className="text-[var(--fg-secondary)]">See print outputs and error traces instantly in the integrated console. No heavy browser plugins required.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Python Editor"
            filename={filename || "main.py"}
            defaultFilename="main.py"
            extension="py"
            toolId="python"
            toolbarSlot={<PythonActions onRun={handleRun} onSnippet={handleSnippet} isReady={!isRunning} isLoading={isRunning} />}
            editorSlot={EditorContent}
            previewSlot={<PythonConsole logs={logs} onClear={handleClear} status="ready" />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/x-python" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "main.py"; a.click();
            }}
        />
    );
}