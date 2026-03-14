"use client";

import { Bold, Italic, AlignLeft, Type, WrapText, Hash, Search } from "lucide-react";

interface Props {
    showLineNumbers: boolean;
    wordWrap: boolean;
    onToggleNumbers: () => void;
    onToggleWrap: () => void;
    onFind: () => void;
}

export default function TextActions({ showLineNumbers, wordWrap, onToggleNumbers, onToggleWrap, onFind }: Props) {

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";
    const activeClass = "bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* View Controls */}
            <div className="flex items-center gap-2">
                <button onClick={onToggleNumbers} className={`${btnClass} ${showLineNumbers ? activeClass : ''}`}>
                    <Hash size={14} /> Lines
                </button>
                <button onClick={onToggleWrap} className={`${btnClass} ${wordWrap ? activeClass : ''}`}>
                    <WrapText size={14} /> Wrap
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Edit Tools */}
            <div className="flex items-center gap-2">
                <button onClick={onFind} className={btnClass}>
                    <Search size={14} /> Find
                </button>
            </div>
        </div>
    );
}