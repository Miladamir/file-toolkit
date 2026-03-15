"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import { Link2, Unlink, Globe, Copy, Download, Settings2 } from "lucide-react";

type Mode = "encode" | "decode";

interface ParsedUrl {
    protocol: string;
    host: string;
    pathname: string;
    hash: string;
    params: [string, string][];
}

export default function UrlEncoderPage() {
    const [mode, setMode] = useState<Mode>("encode");
    const [input, setInput] = useState("https://example.com/path?name=John Doe&age=25");
    const [isFullUrl, setIsFullUrl] = useState(false);

    // --- Core Logic ---
    const { output, parsedUrl, error } = useMemo(() => {
        if (!input) return { output: "", parsedUrl: null, error: null };

        try {
            let result = "";

            if (mode === "encode") {
                // Full URL preserves structure (://, ?, &), Component encodes everything
                result = isFullUrl ? encodeURI(input) : encodeURIComponent(input);
            } else {
                // Try decoding component first, fallback to decode URI if it looks like a full URI
                // decodeURIComponent is generally safer for mixed content
                result = decodeURIComponent(input);
            }

            // Try to parse as URL
            let parsed: ParsedUrl | null = null;

            // Only parse if it looks like a URL (has protocol)
            if (/^https?:\/\//i.test(result)) {
                try {
                    const urlObj = new URL(result);
                    const params: [string, string][] = [];
                    urlObj.searchParams.forEach((value, key) => params.push([key, value]));

                    parsed = {
                        protocol: urlObj.protocol,
                        host: urlObj.host,
                        pathname: urlObj.pathname,
                        hash: urlObj.hash,
                        params
                    };
                } catch {
                    // Not a valid URL structure, ignore parsing
                }
            }

            return { output: result, parsedUrl: parsed, error: null };

        } catch (e: any) {
            return { output: "", parsedUrl: null, error: "Invalid input for decoding." };
        }
    }, [input, mode, isFullUrl]);

    // --- Sub Components ---

    const Controls = (
        <div className="flex items-center gap-4 h-full">
            {/* Mode Toggle */}
            <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border)]">
                <button
                    onClick={() => setMode("encode")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'encode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    <div className="flex items-center gap-1.5">
                        <Link2 size={12} /> Encode
                    </div>
                </button>
                <button
                    onClick={() => setMode("decode")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'decode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    <div className="flex items-center gap-1.5">
                        <Unlink size={12} /> Decode
                    </div>
                </button>
            </div>

            {/* Options */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isFullUrl}
                    onChange={(e) => setIsFullUrl(e.target.checked)}
                    className="accent-[var(--accent)] w-4 h-4"
                    disabled={mode === 'decode'}
                />
                <span className={`text-xs font-medium ${mode === 'decode' ? 'text-[var(--fg-secondary)] opacity-50' : 'text-[var(--fg-secondary)]'}`}>
                    Encode Full URL
                </span>
            </label>
            {mode === 'decode' && (
                <span className="text-[10px] text-[var(--fg-secondary)] italic">
                    (Auto-detects encoding)
                </span>
            )}
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Input</span>
                <span>{input.length} chars</span>
            </div>
            <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                    language="plaintext"
                    placeholder="Paste URL or text..."
                    value={input}
                    onChange={setInput}
                />
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            {/* Output Text Area */}
            <div className="flex-1 overflow-auto relative border-b border-[var(--border)]">
                <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between sticky top-0 z-10">
                    <span>Output</span>
                    <span>{output.length} chars</span>
                </div>
                {error ? (
                    <div className="p-4 text-red-500 text-sm">{error}</div>
                ) : (
                    <div className="p-4 font-mono text-sm whitespace-pre-wrap break-all">
                        {output || "Output will appear here..."}
                    </div>
                )}
            </div>

            {/* URL Breakdown */}
            {parsedUrl && (
                <div className="flex-shrink-0 border-t-2 border-[var(--accent)] bg-[var(--bg-secondary)]">
                    <div className="p-4 space-y-3">
                        <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-2">
                            <Globe size={14} /> URL Breakdown
                        </h3>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className="flex justify-between border-b border-[var(--border)] py-1">
                                <span className="text-[var(--fg-secondary)]">Protocol</span>
                                <span className="font-mono">{parsedUrl.protocol}</span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--border)] py-1">
                                <span className="text-[var(--fg-secondary)]">Host</span>
                                <span className="font-mono">{parsedUrl.host}</span>
                            </div>
                            <div className="flex justify-between border-b border-[var(--border)] py-1 col-span-2">
                                <span className="text-[var(--fg-secondary)]">Path</span>
                                <span className="font-mono">{parsedUrl.pathname}</span>
                            </div>
                        </div>

                        {parsedUrl.params.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-bold text-[var(--fg-secondary)] uppercase mb-2">Query Params</h4>
                                <div className="bg-[var(--bg)] rounded border border-[var(--border)] overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-[var(--bg-secondary)]">
                                            <tr>
                                                <th className="p-2 text-left border-b border-[var(--border)] font-medium text-[var(--fg-secondary)]">Key</th>
                                                <th className="p-2 text-left border-b border-[var(--border)] font-medium text-[var(--fg-secondary)]">Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedUrl.params.map(([key, val], i) => (
                                                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                                                    <td className="p-2 font-mono font-medium text-[var(--accent)]">{key}</td>
                                                    <td className="p-2 font-mono">{val}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">URL Encoder / Decoder</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Smart Encoding</h3>
                    <p className="text-[var(--fg-secondary)]">Toggle between component encoding (spaces to %20) and full URL encoding (preserves protocol and query structure).</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">URL Parser</h3>
                    <p className="text-[var(--fg-secondary)]">Automatically detects valid URLs and displays a detailed breakdown of protocol, host, path, and query parameters.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="URL Encoder"
            filename="url.txt"
            defaultFilename="url.txt"
            extension="txt"
            toolId="url-encoder"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(output); toast.success("Output copied!"); }}
            onDownload={() => {
                const blob = new Blob([output], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "url.txt";
                a.click();
            }}
        />
    );
}