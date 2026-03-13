"use client";

import { useState, useMemo } from "react";

const escapeHtml = (unsafe: string) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export default function RegexClient() {
    const [pattern, setPattern] = useState("");
    const [flags, setFlags] = useState("g");
    const [text, setText] = useState("");

    const result = useMemo(() => {
        const escapedText = escapeHtml(text);

        // If no pattern, just return text
        if (!pattern) return { matches: [], error: null, highlighted: escapedText, regexStr: "" };

        try {
            // Ensure flags are valid string
            const safeFlags = flags || "";

            // Create Regex
            const regex = new RegExp(pattern, safeFlags);
            const regexStr = regex.toString();

            const matches: any[] = [];
            let match;

            // Use exec loop which is safer than matchAll for various flag combinations
            // Reset lastIndex to ensure clean start
            regex.lastIndex = 0;

            while ((match = regex.exec(text)) !== null) {
                matches.push(match);

                // Prevent infinite loops for zero-length matches (e.g., /(?:)/)
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }

                // If not global, break after first match to avoid infinite loop
                if (!regex.global) break;
            }

            // Highlight Logic
            let output = "";
            let lastIndex = 0;

            // Sort matches by index just in case
            matches.sort((a, b) => a.index - b.index);

            for (const m of matches) {
                const start = m.index;
                const end = start + m[0].length;

                // Add text before match
                output += escapeHtml(text.substring(lastIndex, start));
                // Add match with highlight
                output += `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${escapeHtml(text.substring(start, end))}</mark>`;

                lastIndex = end;
            }
            output += escapeHtml(text.substring(lastIndex));

            return { matches, error: null, highlighted: output, regexStr };

        } catch (e: any) {
            return { matches: [], error: e.message, highlighted: escapedText, regexStr: "Invalid" };
        }
    }, [pattern, flags, text]);

    return (
        <div className="flex flex-col h-full">
            {/* Top Controls */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Pattern Input */}
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Regular Expression
                        </label>
                        <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500">
                            <span className="px-2 text-zinc-400 font-bold">/</span>
                            <input
                                type="text"
                                value={pattern}
                                onChange={(e) => setPattern(e.target.value)}
                                placeholder=".*"
                                className="flex-1 p-2 font-mono text-sm bg-transparent focus:outline-none"
                            />
                            <span className="px-2 text-zinc-400 font-bold">/</span>
                            <span className="px-2 text-zinc-400 font-mono text-xs border-l border-zinc-200 dark:border-zinc-700">{flags}</span>
                        </div>
                    </div>

                    {/* Flags Input */}
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                            Flags
                        </label>
                        <input
                            type="text"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            placeholder="g"
                            className="w-full p-2 font-mono text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Debug Info / Error */}
                <div className="flex justify-between items-center text-xs">
                    {result.error ? (
                        <div className="p-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-300 rounded border border-red-200 dark:border-red-800 font-mono w-full">
                            Error: {result.error}
                        </div>
                    ) : (
                        <div className="text-zinc-500 font-mono">
                            Constructed: <span className="text-blue-500">{result.regexStr}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700 overflow-hidden">

                {/* Left: Test String */}
                <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        Test String
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your text here to test matches..."
                        className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-zinc-950 resize-none focus:outline-none"
                    />
                </div>

                {/* Right: Matches / Highlighted */}
                <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex justify-between">
                        <span>Matches</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{result.matches.length} found</span>
                    </div>

                    <div className="flex-1 overflow-auto p-4 bg-white dark:bg-zinc-950">
                        {text ? (
                            <pre
                                className="font-mono text-sm whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200"
                                dangerouslySetInnerHTML={{ __html: result.highlighted }}
                            />
                        ) : (
                            <p className="text-zinc-400 text-sm">Enter text to see matches.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}