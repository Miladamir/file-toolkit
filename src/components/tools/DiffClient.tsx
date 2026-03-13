"use client";

import { useState } from "react";
import * as Diff from "diff";
import { cn } from "@/lib/utils";

export default function DiffClient() {
    const [original, setOriginal] = useState("");
    const [modified, setModified] = useState("");

    // Calculate diff
    const diff = Diff.diffWords(original, modified); // Using diffWords for readability, can use diffLines

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar / Header */}
            <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Diff Checker</span>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-200 dark:bg-green-900 border border-green-500 rounded-sm"></span> Added</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-200 dark:bg-red-900 border border-red-500 rounded-sm"></span> Removed</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700 overflow-hidden">

                {/* Left Side: Original */}
                <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        Original
                    </div>
                    <textarea
                        value={original}
                        onChange={(e) => setOriginal(e.target.value)}
                        placeholder="Paste original text here..."
                        className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-zinc-950 resize-none focus:outline-none"
                    />
                </div>

                {/* Right Side: Modified */}
                <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-medium border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        Modified
                    </div>
                    <textarea
                        value={modified}
                        onChange={(e) => setModified(e.target.value)}
                        placeholder="Paste modified text here..."
                        className="flex-1 w-full p-4 font-mono text-sm bg-white dark:bg-zinc-950 resize-none focus:outline-none"
                    />
                </div>
            </div>

            {/* Bottom Panel: Diff Result View */}
            <div className="h-64 border-t border-zinc-200 dark:border-zinc-700 overflow-auto bg-zinc-50 dark:bg-zinc-900 p-4">
                <div className="font-mono text-sm whitespace-pre-wrap">
                    {diff.map((part, index) => (
                        <span
                            key={index}
                            className={cn(
                                part.added && "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200",
                                part.removed && "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through"
                            )}
                        >
                            {part.value}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}