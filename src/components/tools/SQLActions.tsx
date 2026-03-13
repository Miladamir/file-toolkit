"use client";

import { useFileStore } from "@/store/editorStore";
import { format as formatSQL } from "sql-formatter";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";

export default function SQLActions() {
    const { content, setContent } = useFileStore();

    const handleFormat = () => {
        if (!content) {
            toast.error("No SQL to format");
            return;
        }
        try {
            const formatted = formatSQL(content, {
                language: "sql", // Supports standard SQL, can be configured for specific dialects
                tabWidth: 2,
                keywordCase: "upper", // Convert keywords to uppercase
            });
            setContent(formatted);
            toast.success("SQL Formatted!");
        } catch (e: any) {
            toast.error(`Formatting Error: ${e.message}`);
        }
    };

    return (
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-2">
            <button
                onClick={handleFormat}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Format SQL"
            >
                <Wand2 className="h-3.5 w-3.5" />
                Format
            </button>
        </div>
    );
}