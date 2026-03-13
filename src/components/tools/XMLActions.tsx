"use client";

import { useFileStore } from "@/store/editorStore";
import xmlFormat from "xml-formatter";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";

export default function XMLActions() {
    const { content, setContent } = useFileStore();

    const handleFormat = () => {
        if (!content) {
            toast.error("No XML to format");
            return;
        }
        try {
            // xml-formatter options: strict mode might throw errors for invalid XML
            const formatted = xmlFormat(content, {
                indentation: "  ",
                collapseContent: true,
            });
            setContent(formatted);
            toast.success("XML Formatted!");
        } catch (e: any) {
            toast.error(`Invalid XML: ${e.message}`);
        }
    };

    return (
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-2">
            <button
                onClick={handleFormat}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Format XML"
            >
                <Wand2 className="h-3.5 w-3.5" />
                Format
            </button>
        </div>
    );
}