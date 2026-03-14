"use client";

import { ArrowRightLeft, Trash2, Search } from "lucide-react";

interface Props {
    onCompare: () => void;
    onClear: () => void;
    onSwap: () => void;
}

export default function DiffActions({ onCompare, onClear, onSwap }: Props) {

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Compare Button */}
            <button
                onClick={onCompare}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
                <Search size={14} /> Compare
            </button>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Utilities */}
            <div className="flex items-center gap-2">
                <button onClick={onSwap} className={btnClass}>
                    <ArrowRightLeft size={14} /> Swap
                </button>
                <button onClick={onClear} className={btnClass}>
                    <Trash2 size={14} /> Clear
                </button>
            </div>
        </div>
    );
}