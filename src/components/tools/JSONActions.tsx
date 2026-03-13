"use client";

import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Wand2, Minimize2, CheckCircle } from "lucide-react";

export default function JSONActions() {
    const { content, setContent } = useFileStore();

    const handleFormat = () => {
        if (!content) {
            toast.error("No JSON to format");
            return;
        }
        try {
            const parsed = JSON.parse(content);
            const formatted = JSON.stringify(parsed, null, 2);
            setContent(formatted);
            toast.success("JSON Formatted!");
        } catch (e: any) {
            toast.error(`Invalid JSON: ${e.message}`);
        }
    };

    const handleMinify = () => {
        if (!content) {
            toast.error("No JSON to minify");
            return;
        }
        try {
            const parsed = JSON.parse(content);
            const minified = JSON.stringify(parsed);
            setContent(minified);
            toast.success("JSON Minified!");
        } catch (e: any) {
            toast.error(`Invalid JSON: ${e.message}`);
        }
    };

    const handleValidate = () => {
        if (!content) {
            toast.error("No JSON to validate");
            return;
        }
        try {
            JSON.parse(content);
            toast.success("Valid JSON!", {
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
            });
        } catch (e: any) {
            toast.error(`Invalid JSON: ${e.message}`);
        }
    };

    return (
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-2">
            <button
                onClick={handleFormat}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Format JSON"
            >
                <Wand2 className="h-3.5 w-3.5" />
                Format
            </button>
            <button
                onClick={handleMinify}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Minify JSON"
            >
                <Minimize2 className="h-3.5 w-3.5" />
                Minify
            </button>
            <button
                onClick={handleValidate}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Validate JSON"
            >
                <CheckCircle className="h-3.5 w-3.5" />
                Validate
            </button>
        </div>
    );
}