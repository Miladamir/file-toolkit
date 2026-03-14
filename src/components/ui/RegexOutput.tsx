"use client";

import { useMemo } from "react";

interface Match {
    index: number;
    value: string;
    groups: { [key: string]: string } | null;
}

interface Props {
    text: string;
    regex: RegExp | null;
}

export default function RegexOutput({ text, regex }: Props) {
    const result = useMemo(() => {
        if (!regex) return { highlighted: text, matches: [], error: null };

        try {
            const matches: Match[] = [];
            let match;

            // Use matchAll for global flag support
            const flags = regex.flags;
            const re = new RegExp(regex.source, flags.includes('g') ? flags : flags + 'g');

            while ((match = re.exec(text)) !== null) {
                matches.push({
                    index: match.index,
                    value: match[0],
                    groups: match.groups || null
                });
                // Prevent infinite loop for zero-length matches
                if (match[0].length === 0) re.lastIndex++;
            }

            // Build highlighted string
            let highlighted = '';
            let lastIndex = 0;

            matches.forEach((m) => {
                // Add preceding text
                highlighted += escapeHtml(text.substring(lastIndex, m.index));

                // Add match
                highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-500/30 text-inherit rounded px-0.5">${escapeHtml(m.value)}</mark>`;
                lastIndex = m.index + m.value.length;
            });

            highlighted += escapeHtml(text.substring(lastIndex));

            return { highlighted, matches, error: null };
        } catch (e: any) {
            return { highlighted: text, matches: [], error: e.message };
        }
    }, [text, regex]);

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            {/* Highlighted Text View */}
            <div className="flex-1 overflow-auto p-4 bg-[var(--bg)] border-b border-[var(--border)]">
                <pre className="font-mono text-sm whitespace-pre-wrap break-words text-[var(--fg)]" dangerouslySetInnerHTML={{ __html: result.highlighted }} />
            </div>

            {/* Match List */}
            <div className="h-1/3 overflow-auto bg-[var(--bg-secondary)]">
                <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--toolbar-bg)] text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider sticky top-0">
                    Matches ({result.matches.length})
                </div>

                {result.matches.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[var(--fg-secondary)]">No matches found</div>
                ) : (
                    <div className="p-2 space-y-1">
                        {result.matches.map((m, i) => (
                            <div key={i} className="bg-[var(--bg)] p-2 rounded border border-[var(--border)] text-xs font-mono">
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--accent)] font-bold">#{i + 1}</span>
                                    <span className="text-[var(--fg-secondary)]">Index: {m.index}</span>
                                </div>
                                <div className="mt-1 text-[var(--fg)] break-all">{escapeHtml(m.value)}</div>
                                {m.groups && (
                                    <div className="mt-1 pl-2 border-l-2 border-[var(--accent-light)] text-[var(--fg-secondary)]">
                                        {Object.entries(m.groups).map(([k, v]) => (
                                            <div key={k}><span className="text-teal-500">{k}</span>: {escapeHtml(v)}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function escapeHtml(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}