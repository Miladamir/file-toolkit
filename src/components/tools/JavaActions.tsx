"use client";

import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Code2, FileCode, Repeat, Braces } from "lucide-react";

export default function JavaActions() {
    const { content, setContent } = useFileStore();

    const insert = (code: string) => {
        setContent(content + "\n" + code);
        toast.success("Snippet inserted");
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            <div className="flex items-center gap-2">
                <button onClick={() => insert('public class Main {\n    public static void main(String[] args) {\n        \n    }\n}')} className={btnClass}>
                    <Code2 size={14} /> main
                </button>
                <button onClick={() => insert('System.out.println("");')} className={btnClass}>
                    <FileCode size={14} /> sysout
                </button>
                <button onClick={() => insert('Scanner sc = new Scanner(System.in);')} className={btnClass}>
                    <Repeat size={14} /> Scanner
                </button>
                <button onClick={() => insert('class MyClass {\n    \n}')} className={btnClass}>
                    <Braces size={14} /> class
                </button>
            </div>
        </div>
    );
}