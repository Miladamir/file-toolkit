"use client";

import { useMemo } from "react";
import * as Diff from "diff";

interface Props {
    original: string;
    modified: string;
}

export default function DiffViewer({ original, modified }: Props) {
    const diff = useMemo(() => {
        if (!original && !modified) return [];
        return Diff.diffLines(original, modified);
    }, [original, modified]);

    if (diff.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)]">
                Click "Compare" to see differences
            </div>
        );
    }

    // Calculate line numbers
    let oldLine = 1;
    let newLine = 1;

    return (
        <div className="h-full w-full overflow-auto font-mono text-sm bg-[var(--bg-secondary)]">
            {diff.map((part, index) => {
                const lines = part.value.split("\n");
                // Remove the last empty string if the value ended with a newline
                if (lines[lines.length - 1] === "") lines.pop();

                return lines.map((line, i) => {
                    const bgColor = part.added
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : part.removed
                            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 line-through"
                            : "text-[var(--fg)]";

                    const prefix = part.added ? "+" : part.removed ? "-" : " ";

                    const currentOld = part.removed || !part.added ? oldLine + i : "";
                    const currentNew = part.added || !part.removed ? newLine + i : "";

                    // Update counters after rendering
                    if (!part.added) oldLine += lines.length;
                    if (!part.removed) newLine += lines.length;

                    return (
                        <div
                            key={`${index}-${i}`}
                            className={`flex ${bgColor} hover:opacity-80 transition-opacity`}
                        >
                            {/* Line Numbers */}
                            <div className="w-12 flex-shrink-0 border-r border-[var(--border)] text-right pr-2 text-[var(--fg-secondary)] select-none flex">
                                <span className="w-6">{currentOld}</span>
                                <span className="w-6">{currentNew}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pl-2 whitespace-pre">
                                <span className="mr-2 opacity-50">{prefix}</span>
                                {line || " "}
                            </div>
                        </div>
                    );
                });
            })}
        </div>
    );
}