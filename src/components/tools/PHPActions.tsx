"use client";

import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Code2, FileCode, Repeat, Braces } from "lucide-react";

export default function PHPActions() {
    const { content, setContent } = useFileStore();

    const insert = (code: string) => {
        setContent(content + "\n" + code);
        toast.success("Snippet inserted");
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Snippets */}
            <div className="flex items-center gap-2">
                <button onClick={() => insert('<?php\n    \n?>')} className={btnClass}>
                    <Code2 size={14} /> PHP Tag
                </button>
                <button onClick={() => insert('echo "";')} className={btnClass}>
                    <FileCode size={14} /> echo
                </button>
                <button onClick={() => insert('foreach ($arr as $item) {\n    \n}')} className={btnClass}>
                    <Repeat size={14} /> foreach
                </button>
                <button onClick={() => insert('$arr = array();')} className={btnClass}>
                    <Braces size={14} /> array
                </button>
            </div>
        </div>
    );
}