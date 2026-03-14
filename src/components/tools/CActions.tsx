"use client";

import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Code2, Combine, AlignLeft } from "lucide-react";

export default function CActions() {
    const { content, setContent } = useFileStore();

    const insert = (code: string) => {
        setContent(content + "\n" + code);
        toast.success("Snippet inserted");
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            <div className="flex items-center gap-2">
                <button onClick={() => insert('#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}')} className={btnClass}>
                    <Code2 size={14} /> main
                </button>
                <button onClick={() => insert('printf("Hello\\n");')} className={btnClass}>
                    <AlignLeft size={14} /> printf
                </button>
                <button onClick={() => insert('scanf("%d", &n);')} className={btnClass}>
                    <Combine size={14} /> scanf
                </button>
            </div>
        </div>
    );
}