"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import RegexInput from "@/components/ui/RegexInput";
import RegexOutput from "@/components/ui/RegexOutput";
import CodeGenerator from "@/components/ui/CodeGenerator";
import { toast } from "sonner";
import { FileCode, Search } from "lucide-react";

export default function RegexToolPage() {
    const [pattern, setPattern] = useState("[A-Z]\\w+");
    const [flags, setFlags] = useState<{ [key: string]: boolean }>({ g: true, i: false, m: false });
    const [testString, setTestString] = useState("Hello World.\nThis is a Test String.\nRegular Expressions are powerful.\nMatches words starting with Capital letters.");
    const [regexError, setRegexError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"matches" | "code">("matches");

    // Compile Regex
    const compiledRegex = useMemo(() => {
        try {
            setRegexError(null);
            const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
            if (!pattern) return null;
            return new RegExp(pattern, flagStr);
        } catch (e: any) {
            setRegexError(e.message);
            return null;
        }
    }, [pattern, flags]);

    const handleFlagChange = (flag: string) => {
        setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
    };

    const EditorContent = (
        <div className="h-full w-full flex flex-col">
            {/* Regex Input Bar */}
            <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex-shrink-0">
                <RegexInput
                    value={pattern}
                    onChange={setPattern}
                    flags={flags}
                    onFlagChange={handleFlagChange}
                    error={regexError || undefined}
                />
            </div>

            {/* Test String Editor */}
            <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                    language="markdown"
                    placeholder="Paste test string here..."
                    value={testString}
                    onChange={setTestString}
                />
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            {/* Tab Header */}
            <div className="flex border-b border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
                <button
                    onClick={() => setActiveTab("matches")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "matches" ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
                >
                    <Search size={14} /> Matches
                </button>
                <button
                    onClick={() => setActiveTab("code")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "code" ? "text-[var(--accent)] border-b-2 border-[var(--accent)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg)]"}`}
                >
                    <FileCode size={14} /> Code
                </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-hidden relative">
                <div className={`absolute inset-0 overflow-hidden ${activeTab === "matches" ? "block" : "hidden"}`}>
                    <RegexOutput text={testString} regex={compiledRegex} />
                </div>
                <div className={`absolute inset-0 overflow-auto ${activeTab === "code" ? "block" : "hidden"}`}>
                    <CodeGenerator pattern={pattern} flags={Object.keys(flags).filter(k => flags[k]).join('')} />
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online Regex Tester</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Real-Time Testing</h3>
                    <p className="text-[var(--fg-secondary)]">Write your pattern and instantly see it matched against your test string. Supports global, case-insensitive, and multiline flags.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Code Generation</h3>
                    <p className="text-[var(--fg-secondary)]">Get the equivalent regex code for JavaScript, Python, and Go instantly.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Regex Tester"
            filename="regex.exp"
            defaultFilename="regex.exp"
            extension="txt"
            toolId="regex"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(pattern); toast.success("Pattern copied!"); }}
            onDownload={() => {
                const text = `Pattern: /${pattern}/${Object.keys(flags).filter(k => flags[k]).join('')}\n\nTest String:\n${testString}`;
                const blob = new Blob([text], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "regex.txt"; a.click();
            }}
        />
    );
}