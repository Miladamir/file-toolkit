"use client";

import { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import { ArrowRightLeft, ArrowDownUp, FileUp, Image as ImageIcon, AlertCircle, Copy, Download } from "lucide-react";

type Mode = "encode" | "decode" | "file";

export default function Base64ToolPage() {
    const [mode, setMode] = useState<Mode>("encode");
    const [input, setInput] = useState("Hello World");
    const [output, setOutput] = useState("");
    const [isUrlSafe, setIsUrlSafe] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Core Processing Logic
    useEffect(() => {
        // Skip processing if in file mode (handled by file upload)
        if (mode === "file") return;

        if (!input) {
            setOutput("");
            setImagePreview(null);
            return;
        }

        try {
            let result = "";

            if (mode === "encode") {
                // 1. UTF-8 Encode -> Base64
                result = btoa(unescape(encodeURIComponent(input)));

                // 2. URL Safe
                if (isUrlSafe) {
                    result = result.replace(/\+/g, '-').replace(/\//g, '_');
                }
            } else {
                let base64 = input;

                // 1. Revert URL Safe
                if (isUrlSafe) {
                    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
                }

                // 2. Base64 Decode -> UTF-8
                result = decodeURIComponent(escape(atob(base64)));
            }

            setOutput(result);
            checkForImage(result);

        } catch (e) {
            setOutput("Error: Invalid input for this operation.");
            setImagePreview(null);
        }
    }, [input, mode, isUrlSafe]);

    const checkForImage = (str: string) => {
        // Detect Data URI image
        if (/^data:image\/(png|jpeg|gif|webp);base64,/.test(str)) {
            setImagePreview(str);
        } else {
            setImagePreview(null);
        }
    };

    // --- File Handling ---
    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            const result = evt.target?.result as string;
            setOutput(result);
            setInput(file.name); // Show filename in input area for context
            checkForImage(result);
            toast.success("File encoded to Base64!");
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    // --- Download ---
    const handleDownload = () => {
        if (!output) return;

        // If it's a data URI, try to parse extension
        let extension = "txt";
        let mime = "text/plain";

        const mimeMatch = output.match(/data:(.*?);/);
        if (mimeMatch && mimeMatch[1]) {
            mime = mimeMatch[1];
            if (mime.includes("image")) extension = mime.split("/")[1];
            else if (mime.includes("pdf")) extension = "pdf";
        }

        const a = document.createElement("a");
        a.href = output.startsWith("data:") ? output : `data:${mime};base64,${output}`;
        a.download = `decoded.${extension}`;
        a.click();
    };

    // --- Sub Components ---

    const Controls = (
        <div className="flex items-center gap-4 h-full overflow-x-auto">
            {/* Mode Selector */}
            <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border)] flex-shrink-0">
                <button
                    onClick={() => { setMode("encode"); setInput(""); setOutput(""); setImagePreview(null); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'encode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    Encode
                </button>
                <button
                    onClick={() => { setMode("decode"); setInput(""); setOutput(""); setImagePreview(null); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'decode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    Decode
                </button>
                <button
                    onClick={() => { setMode("file"); setInput(""); setOutput(""); setImagePreview(null); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'file' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    <div className="flex items-center gap-1"><FileUp size={12} /> File</div>
                </button>
            </div>

            {/* Options */}
            <label className="flex items-center gap-2 cursor-pointer select-none flex-shrink-0">
                <input
                    type="checkbox"
                    checked={isUrlSafe}
                    onChange={(e) => setIsUrlSafe(e.target.checked)}
                    className="accent-[var(--accent)] w-4 h-4"
                />
                <span className="text-xs font-medium text-[var(--fg-secondary)]">URL Safe</span>
            </label>
        </div>
    );

    const EditorContent = (
        <div
            className="h-full w-full relative"
            onDragEnter={(e) => { e.preventDefault(); if (mode === 'file') setIsDragging(true); }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            {mode === "file" ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-full w-full flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'bg-[var(--accent-light)]' : 'bg-[var(--bg)]'}`}
                >
                    <FileUp size={48} strokeWidth={1} className="text-[var(--fg-secondary)] mb-4" />
                    <p className="font-medium text-[var(--fg)]">Drop file here or click to upload</p>
                    <p className="text-xs text-[var(--fg-secondary)] mt-1">Output will be a Base64 Data URI</p>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            ) : (
                <div className="h-full w-full">
                    <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider">
                        {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
                    </div>
                    <div className="h-[calc(100%-28px)]">
                        <CodeMirrorEditor
                            language="plaintext"
                            placeholder={mode === 'encode' ? "Enter text..." : "Enter Base64 string..."}
                            value={input}
                            onChange={setInput}
                        />
                    </div>
                </div>
            )}
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>{mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}</span>
                <span>{output.length} chars</span>
            </div>

            <div className="flex-1 overflow-auto relative">
                {imagePreview ? (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--bg-secondary)] p-8">
                        <img src={imagePreview} alt="Preview" className="max-w-full max-h-[60%] object-contain shadow-lg rounded border border-[var(--border)]" />
                        <div className="mt-4 text-xs text-[var(--fg-secondary)]">Image Preview</div>
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        <CodeMirrorEditor
                            language="plaintext"
                            placeholder="Output will appear here..."
                            value={output}
                            onChange={() => { }} // Read-only effectively for preview
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Base64 Encoder & Decoder</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">UTF-8 Support</h3>
                    <p className="text-[var(--fg-secondary)]">Handles Unicode characters correctly using UTF-8 encoding, preventing common decoding errors.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">File to Base64</h3>
                    <p className="text-[var(--fg-secondary)]">Convert any file (images, PDFs, fonts) to a Base64 Data URI. Useful for embedding assets directly in code.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Base64 Tools"
            filename="output.txt"
            defaultFilename="output.txt"
            extension="txt"
            toolId="base64"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(output); toast.success("Output copied!"); }}
            onDownload={handleDownload}
        />
    );
}