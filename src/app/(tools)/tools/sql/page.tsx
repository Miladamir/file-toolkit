"use client";

import { useRef, useState, DragEvent } from "react";
import SqlPageLayout from "@/components/layout/SqlPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import SchemaSidebar from "@/components/tools/SchemaSidebar";
import SQLActions from "@/components/tools/SQLActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { executeMockSQL } from "@/lib/mockDb";

export default function SqlToolPage() {
    const { content, filename, setFileAuto, setContent } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const showDropZone = !content || content.trim() === "";

    // --- Logic ---
    const handleRun = () => {
        const { data, error: err } = executeMockSQL(content);
        if (err) {
            setError(err);
            setResults([]);
            toast.error(err);
        } else {
            setError(null);
            setResults(data);
            toast.success(`Query executed. ${data.length} rows returned.`);
        }
    };

    const handleFormat = () => {
        // Placeholder: You can use sql-formatter library here
        toast.success("Format clicked (implement with sql-formatter if needed)");
    };

    const handleClear = () => {
        setContent("");
        setResults([]);
        setError(null);
    };

    const handleSnippet = (type: string) => {
        const snippets: Record<string, string> = {
            select: "SELECT * FROM users LIMIT 10;",
            join: "SELECT u.name, o.amount FROM users u JOIN orders o ON u.id = o.user_id;",
            insert: "INSERT INTO users (id, name, email) VALUES (5, 'John', 'john@example.com');"
        };
        setContent(snippets[type] || "");
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

    // --- Slots ---
    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-title">Drop SQL file</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".sql" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="sql" />
        </div>
    );

    const ResultsContent = (
        <div className="h-full w-full overflow-auto">
            {error && <div className="p-4 text-red-500 font-mono text-sm">{error}</div>}

            {!error && results.length === 0 && (
                <div className="p-4 text-[var(--fg-secondary)] text-sm">Press "Run" to execute query</div>
            )}

            {results.length > 0 && (
                <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-[var(--bg)] z-10">
                        <tr>
                            {Object.keys(results[0]).map(key => (
                                <th key={key} className="border-b border-[var(--border)] p-2 text-left font-semibold text-[var(--fg)]">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row, i) => (
                            <tr key={i} className="hover:bg-[var(--accent-light)]">
                                {Object.values(row).map((val: any, j) => (
                                    <td key={j} className="border-b border-[var(--border)] p-2">{String(val)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-xl font-bold text-[var(--fg)] mb-4">Online SQL Editor</h2>
            <p className="text-sm">Test SQL queries against a built-in mock database. Supports SELECT, WHERE, and JOIN operations.</p>
        </>
    );

    return (
        <SqlPageLayout
            title="SQL Editor"
            filename={filename || "query.sql"}
            defaultFilename="query.sql"
            extension="sql"
            toolId="sql"
            schemaSlot={<SchemaSidebar />}
            editorSlot={EditorContent}
            resultsSlot={ResultsContent}
            toolbarSlot={<SQLActions onRun={handleRun} onFormat={handleFormat} onClear={handleClear} onSnippet={handleSnippet} />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([content], { type: "text/sql" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = filename || "query.sql"; a.click();
            }}
        />
    );
}