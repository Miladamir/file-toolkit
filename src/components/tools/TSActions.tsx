"use client";

import { Play, Code2, Box, Braces, FileType } from "lucide-react";

interface Props {
    onRun: () => void;
    onInsert: (text: string) => void;
}

export default function TSActions({ onRun, onInsert }: Props) {

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Run Button */}
            <button
                onClick={onRun}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
                <Play size={14} fill="currentColor" /> Run
            </button>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Snippets */}
            <div className="flex items-center gap-2">
                <button onClick={() => onInsert("interface Name {\n  prop: type;\n}\n")} className={btnClass}>
                    <FileType size={14} /> Interface
                </button>
                <button onClick={() => onInsert("class User {\n  constructor(public name: string) {}\n}\n")} className={btnClass}>
                    <Box size={14} /> Class
                </button>
                <button onClick={() => onInsert("const func = (arg: string): void => {\n  \n}\n")} className={btnClass}>
                    <Braces size={14} /> Arrow
                </button>
                <button onClick={() => onInsert("type ID = string | number;\n")} className={btnClass}>
                    <Code2 size={14} /> Type
                </button>
            </div>
        </div>
    );
}