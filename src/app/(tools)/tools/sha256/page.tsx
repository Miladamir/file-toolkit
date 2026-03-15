"use client";

import { useState, useCallback, DragEvent, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import { FileUp, CheckCircle, XCircle, ShieldCheck } from "lucide-react";

export default function SHA256GeneratorPage() {
    const [text, setText] = useState("Hello World");
    const [hash, setHash] = useState("");
    const [isUpper, setIsUpper] = useState(false);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [verifyInput, setVerifyInput] = useState("");
    const [matchStatus, setMatchStatus] = useState<"match" | "mismatch" | null>(null);

    // --- Helpers ---

    // Convert ArrayBuffer to Hex String
    const bufToHex = (buffer: ArrayBuffer) => {
        return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // --- Core Logic ---

    // Calculate SHA-256 for Text
    const calculateTextHash = useCallback(async (str: string) => {
        if (!str) {
            // Hash of empty string
            const emptyBuffer = new TextEncoder().encode("");
            const hashBuffer = await crypto.subtle.digest('SHA-256', emptyBuffer);
            return bufToHex(hashBuffer);
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return bufToHex(hashBuffer);
    }, []);

    // Handle Text Changes
    const handleTextChange = async (val: string) => {
        setText(val);
        setFileInfo(null);
        const result = await calculateTextHash(val);
        setHash(isUpper ? result.toUpperCase() : result.toLowerCase());
    };

    // Toggle Case
    const toggleCase = () => {
        setIsUpper(!isUpper);
        if (hash) {
            setHash(isUpper ? hash.toLowerCase() : hash.toUpperCase());
        }
    };

    // Handle File Hashing (Native API - Fast & Async)
    const handleFile = async (file: File) => {
        if (!file) return;

        setIsProcessing(true);
        setFileInfo({ name: file.name, size: formatBytes(file.size) });
        setHash("Calculating...");

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                // Native Web Crypto API for SHA-256
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                const result = bufToHex(hashBuffer);
                setHash(isUpper ? result.toUpperCase() : result.toLowerCase());
                toast.success("SHA-256 hash generated!");
            } catch (err) {
                setHash("Error processing file");
                toast.error("Failed to hash file.");
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            setHash("Error reading file");
            setIsProcessing(false);
        };

        reader.readAsArrayBuffer(file);
    };

    // --- Verification ---
    const handleVerify = () => {
        if (!hash || !verifyInput) return;
        const match = hash.toLowerCase() === verifyInput.toLowerCase();
        setMatchStatus(match ? "match" : "mismatch");
    };

    // --- Slots ---
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
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col">
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

            {/* File Upload */}
            <div className="p-2 border-t border-[var(--border)] bg-[var(--bg)]">
                <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-[var(--border)] rounded-md cursor-pointer hover:border-[var(--accent)] transition-colors">
                    {isProcessing ? (
                        <div className="animate-spin w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
                    ) : (
                        <FileUp size={16} className="text-[var(--fg-secondary)]" />
                    )}
                    <span className="text-xs text-[var(--fg-secondary)]">
                        {isProcessing ? "Processing..." : "Upload File (SHA-256)"}
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </label>
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            {/* Hash Result */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/30 mb-2">
                    <ShieldCheck size={24} className="text-teal-600" />
                </div>

                <div className="text-xs text-[var(--fg-secondary)] uppercase font-bold tracking-wider">SHA-256</div>

                <div className="w-full max-w-lg bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] shadow-sm select-all text-center">
                    <p className="font-mono text-sm font-medium text-[var(--accent)] break-all leading-relaxed">
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
                        value={verifyInput}
                        onChange={(e) => { setVerifyInput(e.target.value); setMatchStatus(null); }}
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

                {matchStatus && (
                    <div className={`mt-2 text-sm font-medium flex items-center gap-2 ${matchStatus === 'match' ? 'text-green-600' : 'text-red-500'}`}>
                        {matchStatus === 'match' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {matchStatus === 'match' ? "Hashes Match!" : "Hashes Mismatch"}
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">SHA-256 Hash Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Cryptographically Secure</h3>
                    <p className="text-[var(--fg-secondary)]">Uses the native Web Crypto API for fast and secure SHA-256 generation. Suitable for passwords, certificates, and file integrity.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">File & Text Support</h3>
                    <p className="text-[var(--fg-secondary)]">Generate checksums for text strings or entire files. SHA-256 is the industry standard for verifying data integrity.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="SHA-256 Generator"
            filename="hash.txt"
            defaultFilename="hash.txt"
            extension="txt"
            toolId="sha256"
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