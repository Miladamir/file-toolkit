"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import SparkMD5 from "spark-md5";
import { FileUp, Copy, CheckCircle, XCircle, ArrowUpCircle } from "lucide-react";

export default function MD5GeneratorPage() {
    const [text, setText] = useState("Hello World");
    const [hash, setHash] = useState("");
    const [isUpper, setIsUpper] = useState(false);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [verifyHash, setVerifyHash] = useState("");
    const [verifyStatus, setVerifyStatus] = useState<"match" | "mismatch" | null>(null);

    // --- Text Hashing (crypto-js) ---
    const handleTextChange = (val: string) => {
        setText(val);
        setFileInfo(null); // Clear file info if user types
        const result = CryptoJS.MD5(val).toString();
        setHash(isUpper ? result.toUpperCase() : result);
    };

    // --- File Hashing (spark-md5 for chunking - Best Practice) ---
    const calculateFileHash = (file: File) => {
        setFileInfo({ name: file.name, size: formatBytes(file.size) });
        setHash("Calculating...");

        const chunkSize = 2097152; // 2MB chunks
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        let currentChunk = 0;
        const chunks = Math.ceil(file.size / chunkSize);

        reader.onload = (e) => {
            spark.append(e.target?.result as ArrayBuffer); // Append array buffer
            currentChunk++;

            if (currentChunk < chunks) {
                loadNext();
            } else {
                const finalHash = spark.end();
                setHash(isUpper ? finalHash.toUpperCase() : finalHash);
                toast.success("File hash calculated!");
            }
        };

        reader.onerror = () => {
            setHash("Error reading file");
            toast.error("Error reading file");
        };

        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            reader.readAsArrayBuffer(file.slice(start, end));
        }

        loadNext();
    };

    // --- Handlers ---
    const handleFile = (file: File) => {
        calculateFileHash(file);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    const toggleCase = () => {
        setIsUpper(!isUpper);
        if (hash) setHash(isUpper ? hash.toLowerCase() : hash.toUpperCase());
    };

    const handleVerify = () => {
        if (!hash || !verifyHash) return;
        const match = hash.toLowerCase() === verifyHash.toLowerCase();
        setVerifyStatus(match ? "match" : "mismatch");
    };

    // --- Utilities ---
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- UI Slots ---
    const Controls = (
        <div className="flex items-center gap-4 h-full">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isUpper}
                    onChange={toggleCase}
                    className="accent-[var(--accent)] w-4 h-4"
                />
                <span className="text-xs font-medium text-[var(--fg-secondary)]">Uppercase</span>
            </label>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full flex flex-col"
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            {/* File Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-10 bg-[var(--accent-light)] border-2 border-dashed border-[var(--accent)] flex items-center justify-center pointer-events-none">
                    <div className="text-[var(--accent)] font-medium">Drop file here</div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-auto relative">
                <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                    <span>Input Text</span>
                    {fileInfo && <span className="text-[var(--accent)]">{fileInfo.name} ({fileInfo.size})</span>}
                </div>

                <div className="flex-1 min-h-0">
                    <CodeMirrorEditor
                        language="plaintext"
                        placeholder="Type text to hash..."
                        value={text}
                        onChange={handleTextChange}
                    />
                </div>
            </div>

            {/* File Upload Button */}
            <div className="p-2 border-t border-[var(--border)] bg-[var(--bg)]">
                <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-[var(--border)] rounded-md cursor-pointer hover:border-[var(--accent)] transition-colors">
                    <FileUp size={16} className="text-[var(--fg-secondary)]" />
                    <span className="text-xs text-[var(--fg-secondary)]">Upload File (Chunked Hashing)</span>
                    <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            {/* Hash Result */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <div className="text-xs text-[var(--fg-secondary)] uppercase font-bold tracking-wider">MD5 Hash</div>

                <div className="w-full max-w-lg bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] shadow-sm select-all text-center">
                    <p className="font-mono text-xl font-semibold text-[var(--accent)] break-all">
                        {hash || "..."}
                    </p>
                </div>

                <div className="text-xs text-[var(--fg-secondary)]">
                    Length: {hash.length} characters
                </div>
            </div>

            {/* Verify Section */}
            <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider mb-3">Verify Integrity</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={verifyHash}
                        onChange={(e) => { setVerifyHash(e.target.value); setVerifyStatus(null); }}
                        placeholder="Paste hash to compare..."
                        className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <button
                        onClick={handleVerify}
                        className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-xs font-medium hover:bg-[var(--bg)] transition-colors flex items-center gap-2"
                    >
                        Verify
                    </button>
                </div>

                {verifyStatus && (
                    <div className={`mt-2 text-sm font-medium flex items-center gap-2 ${verifyStatus === 'match' ? 'text-green-600' : 'text-red-500'}`}>
                        {verifyStatus === 'match' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {verifyStatus === 'match' ? "Hashes Match!" : "Hashes Mismatch"}
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">MD5 Hash Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Text & File Support</h3>
                    <p className="text-[var(--fg-secondary)]">Instantly generate MD5 checksums for text strings or entire files. Files are processed in chunks to handle large sizes efficiently.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Verify Integrity</h3>
                    <p className="text-[var(--fg-secondary)]">Compare your generated hash against a known value to verify data integrity and detect corruption.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="MD5 Generator"
            filename="hash.txt"
            defaultFilename="hash.txt"
            extension="txt"
            toolId="md5"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(hash); toast.success("Hash copied!"); }}
            onDownload={() => {
                const blob = new Blob([hash], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "hash.txt";
                a.click();
            }}
        />
    );
}