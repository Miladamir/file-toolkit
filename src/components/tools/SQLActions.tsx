"use client";

import { format as formatSQL } from 'sql-formatter';
import { toast } from "sonner";
import { Play, Wand2, Trash2, FileCode } from "lucide-react";

interface Props {
    onRun: () => void;
    onFormat: () => void;
    onClear: () => void;
    onSnippet: (type: string) => void;
}

export default function SQLActions({ onRun, onFormat, onClear, onSnippet }: Props) {
    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Run */}
            <button
                onClick={onRun}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
                <Play size={14} fill="currentColor" /> Run
            </button>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Utilities */}
            <div className="flex items-center gap-2">
                <button onClick={onFormat} className={btnClass}>
                    <Wand2 size={14} /> Format
                </button>
                <button onClick={onClear} className={btnClass}>
                    <Trash2 size={14} /> Clear
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Snippets */}
            <div className="flex items-center gap-2">
                <button onClick={() => onSnippet('select')} className={btnClass}>
                    SELECT
                </button>
                <button onClick={() => onSnippet('join')} className={btnClass}>
                    JOIN
                </button>
                <button onClick={() => onSnippet('insert')} className={btnClass}>
                    INSERT
                </button>
            </div>
        </div>
    );
}