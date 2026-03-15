"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import { ShieldCheck, Code2, Eye, FileCode } from "lucide-react";

type Mode = "encode" | "decode";
type EncodeType = "basic" | "named";

// --- Entity Maps ---

// Basic security entities
const basicEntities: [RegExp, string][] = [
    [/&/g, "&amp;"],
    [/</g, "&lt;"],
    [/>/g, "&gt;"],
    [/"/g, "&quot;"],
    [/'/g, "&#39;"]
];

// Extended named entities map (subset of common symbols)
const namedEntitiesMap: Record<string, string> = {
    '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;',
    '£': '&pound;', '¥': '&yen;', '¢': '&cent;', '§': '&sect;',
    '±': '&plusmn;', '×': '&times;', '÷': '&divide;', '…': '&hellip;',
    '°': '&deg;', '¶': '&para;', '•': '&bull;', '·': '&middot;',
    '¼': '&frac14;', '½': '&frac12;', '¾': '&frac34;',
    '←': '&larr;', '→': '&rarr;', '↑': '&uarr;', '↓': '&darr;',
    '♠': '&spades;', '♣': '&clubs;', '♥': '&hearts;', '♦': '&diams;',
    '“': '&ldquo;', '”': '&rdquo;', '‘': '&lsquo;', '’': '&rsquo;',
    '–': '&ndash;', '—': '&mdash;'
};

// --- Core Logic Functions ---

function encodeHtml(str: string, type: EncodeType): string {
    // 1. Basic encoding (always applied first for security)
    let result = str;
    basicEntities.forEach(([regex, entity]) => {
        result = result.replace(regex, entity);
    });

    // 2. Named Entities (optional)
    if (type === "named") {
        Object.entries(namedEntitiesMap).forEach(([char, entity]) => {
            const regex = new RegExp(char, 'g');
            result = result.replace(regex, entity);
        });
    }

    return result;
}

function decodeHtml(str: string): string {
    // The most robust way to decode HTML entities in the browser
    // is using the DOM parser. It handles named, decimal, and hex.
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

export default function HtmlEntitiesPage() {
    const [mode, setMode] = useState<Mode>("encode");
    const [encodeType, setEncodeType] = useState<EncodeType>("basic");
    const [input, setInput] = useState('<div>Hello & "World"</div>');

    // Processing Logic
    const { output, error } = useMemo(() => {
        if (!input) return { output: "", error: null };

        try {
            const result = mode === "encode"
                ? encodeHtml(input, encodeType)
                : decodeHtml(input);
            return { output: result, error: null };
        } catch (e: any) {
            return { output: "", error: "Processing error" };
        }
    }, [input, mode, encodeType]);

    const Controls = (
        <div className="flex items-center gap-4 h-full">
            {/* Mode Toggle */}
            <div className="flex items-center bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border)]">
                <button
                    onClick={() => setMode("encode")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'encode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    Encode
                </button>
                <button
                    onClick={() => setMode("decode")}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${mode === 'decode' ? 'bg-[var(--bg)] text-[var(--accent)] shadow-sm' : 'text-[var(--fg-secondary)] hover:text-[var(--fg)]'}`}
                >
                    Decode
                </button>
            </div>

            {/* Encode Options */}
            {mode === "encode" && (
                <div className="flex items-center gap-3 text-xs text-[var(--fg-secondary)]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="radio"
                            name="encType"
                            checked={encodeType === "basic"}
                            onChange={() => setEncodeType("basic")}
                            className="accent-[var(--accent)]"
                        />
                        Basic (Security)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="radio"
                            name="encType"
                            checked={encodeType === "named"}
                            onChange={() => setEncodeType("named")}
                            className="accent-[var(--accent)]"
                        />
                        Named Entities
                    </label>
                </div>
            )}
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>{mode === 'encode' ? 'Plain Text' : 'HTML Input'}</span>
                <span>{input.length} chars</span>
            </div>
            <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                    language={mode === 'encode' ? 'plaintext' : 'html'}
                    placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste HTML entities...'}
                    value={input}
                    onChange={setInput}
                />
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col">
            {/* Text Output */}
            <div className="flex-1 overflow-auto relative border-b border-[var(--border)]">
                <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider sticky top-0 z-10">
                    {mode === 'encode' ? 'Encoded Output' : 'Decoded Text'}
                </div>
                {error ? (
                    <div className="p-4 text-red-500 text-sm">{error}</div>
                ) : (
                    <div className="p-4 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
                        {output || "Output will appear here..."}
                    </div>
                )}
            </div>

            {/* Rendered Preview (Only for Decode Mode) */}
            {mode === "decode" && (
                <div className="flex-1 overflow-auto bg-white dark:bg-zinc-900 border-t-2 border-[var(--accent)]">
                    <div className="p-2 text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center gap-1.5">
                        <Eye size={12} /> Rendered Preview
                    </div>
                    <div
                        className="p-4 text-sm text-zinc-900 dark:text-zinc-100"
                        dangerouslySetInnerHTML={{ __html: output }}
                    />
                </div>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">HTML Entity Encoder / Decoder</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Security & XSS Prevention</h3>
                    <p className="text-[var(--fg-secondary)]">Encode special characters to prevent XSS attacks. The "Basic" mode covers the essential security characters.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Robust Decoding</h3>
                    <p className="text-[var(--fg-secondary)]">Decode all HTML entities including named entities (&amp;copy;), decimal (&amp;#169;), and hex (&amp;#xA9;) codes.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="HTML Entities"
            filename="entities.txt"
            defaultFilename="entities.txt"
            extension="txt"
            toolId="html-entities"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(output); toast.success("Output copied!"); }}
            onDownload={() => {
                const blob = new Blob([output], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "entities.txt";
                a.click();
            }}
        />
    );
}