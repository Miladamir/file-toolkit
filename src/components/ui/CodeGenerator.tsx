"use client";

import { useMemo } from "react";

interface Props {
    pattern: string;
    flags: string;
}

export default function CodeGenerator({ pattern, flags }: Props) {
    const code = useMemo(() => {
        const js = `const regex = /${pattern}/${flags};`;
        const py = `import re\nregex = re.compile(r"${pattern}")`;
        const go = `package main\n\nimport "regexp"\n\nregex := regexp.MustCompile(\`${pattern}\`)`;

        return { js, py, go };
    }, [pattern, flags]);

    return (
        <div className="h-full w-full overflow-auto p-4 space-y-6">
            <div>
                <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase mb-2">JavaScript</h3>
                <pre className="bg-[var(--editor-bg)] p-3 rounded text-xs font-mono border border-[var(--border)] overflow-x-auto">{code.js}</pre>
            </div>
            <div>
                <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase mb-2">Python</h3>
                <pre className="bg-[var(--editor-bg)] p-3 rounded text-xs font-mono border border-[var(--border)] overflow-x-auto">{code.py}</pre>
            </div>
            <div>
                <h3 className="text-xs font-semibold text-[var(--fg-secondary)] uppercase mb-2">Golang</h3>
                <pre className="bg-[var(--editor-bg)] p-3 rounded text-xs font-mono border border-[var(--border)] overflow-x-auto">{code.go}</pre>
            </div>
        </div>
    );
}