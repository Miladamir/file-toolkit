"use client";

import { Play, Plus, Box, Repeat, Code2, Loader2 } from "lucide-react";

interface Props {
    onRun: () => void;
    onSnippet: (code: string) => void;
    isReady: boolean;
    isLoading: boolean;
}

export default function PythonActions({ onRun, onSnippet, isReady, isLoading }: Props) {

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Run Button */}
            <button
                onClick={onRun}
                disabled={!isReady}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm ${isReady
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
            >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                {isLoading ? "Running..." : "Run"}
            </button>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Snippets */}
            <div className="flex items-center gap-2">
                <button onClick={() => onSnippet('print("Hello World")')} className={btnClass}>
                    <Plus size={14} /> Print
                </button>
                <button onClick={() => onSnippet('def my_func(arg):\n    return arg\n')} className={btnClass}>
                    <Box size={14} /> Def
                </button>
                <button onClick={() => onSnippet('for i in range(10):\n    print(i)\n')} className={btnClass}>
                    <Repeat size={14} /> Loop
                </button>
                <button onClick={() => onSnippet('class MyClass:\n    def __init__(self):\n        pass\n')} className={btnClass}>
                    <Code2 size={14} /> Class
                </button>
            </div>
        </div>
    );
}