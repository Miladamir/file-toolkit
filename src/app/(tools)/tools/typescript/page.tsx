"use client";

import { useRef, useState, DragEvent, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import TSOutput from "@/components/ui/TSOutput";
import TSActions from "@/components/tools/TSActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { LogEntry } from "@/components/ui/JsConsole";
import * as ts from "typescript"; // Import TypeScript compiler
import { js as beautifyJs } from "js-beautify";

export default function TypescriptToolPage() {
    const { content, filename, setFileAuto, setContent } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [compiledCode, setCompiledCode] = useState("");

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

    // --- Insert Snippet ---
    const handleInsert = (text: string) => {
        setContent(content + "\n" + text);
        toast.success("Snippet inserted");
    };

    // --- Transpile & Run Logic ---
    const runCode = useCallback(() => {
        if (!content) return;

        try {
            // 1. Transpile TS to JS
            const result = ts.transpileModule(content, {
                compilerOptions: {
                    module: ts.ModuleKind.ES2015,
                    target: ts.ScriptTarget.ES2015,
                    strict: true,
                }
            });

            const jsCode = result.outputText;

            // Beautify for display
            setCompiledCode(beautifyJs(jsCode, { indent_size: 2 }));

            // 2. Execute JS
            const newLogs: LogEntry[] = [];
            const timestamp = Date.now();

            const originalConsole = { log: console.log, error: console.error, warn: console.warn };

            const createLogFn = (type: LogEntry['type']) => (...args: any[]) => {
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                newLogs.push({ id: `${timestamp}-${Math.random()}`, type, message });
            };

            console.log = createLogFn('log');
            console.error = createLogFn('error');
            console.warn = createLogFn('warn');

            try {
                // Using eval for simplicity in this sandbox
                eval(jsCode);
            } catch (e: any) {
                newLogs.push({ id: `${timestamp}-err`, type: 'error', message: `Runtime Error: ${e.message}` });
            } finally {
                console.log = originalConsole.log;
                console.error = originalConsole.error;
                console.warn = originalConsole.warn;
                setLogs(newLogs);
            }

        } catch (e: any) {
            // Compilation Error
            setLogs([{ id: Date.now().toString(), type: 'error', message: `Compilation Error: ${e.message}` }]);
        }
    }, [content]);

    const clearConsole = () => setLogs([]);

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
                        <div className="drop-title">Drop TS file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".ts,.tsx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="typescript" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online TypeScript Editor & Compiler</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Transpilation</h3>
                    <p className="text-[var(--fg-secondary)]">Write TypeScript code and see the compiled JavaScript instantly. Perfect for learning how TypeScript handles types and interfaces during compilation.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Sandbox Environment</h3>
                    <p className="text-[var(--fg-secondary)]">Run your code directly in the browser. View console outputs and debug your logic without setting up a local development environment.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="TypeScript Editor"
            filename={filename || "main.ts"}
            defaultFilename="main.ts"
            extension="ts"
            toolId="typescript"
            toolbarSlot={<TSActions onRun={runCode} onInsert={handleInsert} />}
            editorSlot={EditorContent}
            previewSlot={<TSOutput logs={logs} compiledCode={compiledCode} onClear={clearConsole} />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/typescript" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "main.ts"; a.click();
            }}
        />
    );
}