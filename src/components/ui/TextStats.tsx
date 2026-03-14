"use client";

interface Stats {
    lines: number;
    words: number;
    chars: number;
    cursorLine: number;
    cursorCol: number;
    selectedChars: number;
}

export default function TextStats({ stats }: { stats: Stats }) {
    return (
        <div className="flex items-center gap-4 text-xs text-[var(--fg-secondary)] font-mono px-2 py-1 bg-[var(--toolbar-bg)] border-t border-[var(--border)]">
            <span>Ln {stats.cursorLine}</span>
            <span>Col {stats.cursorCol}</span>
            <span className="border-l border-[var(--border)] pl-4">{stats.words} Words</span>
            <span>{stats.chars} Chars</span>
            {stats.selectedChars > 0 && (
                <span className="text-[var(--accent)]">{stats.selectedChars} Selected</span>
            )}
        </div>
    );
}