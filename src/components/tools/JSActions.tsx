"use client";

import { useFileStore } from "@/store/editorStore";
import { js as beautifyJs } from "js-beautify";
import { minify as minifyTs } from "terser";
import { toast } from "sonner";
import { Wand2, Minimize2, Loader2, Play } from "lucide-react";
import { useState } from "react";

interface Props {
    onRun: () => void;
}

export default function JSActions({ onRun }: Props) {
    const { content, setContent } = useFileStore();
    const [isMinifying, setIsMinifying] = useState(false);

    const handleFormat = () => {
        if (!content) return toast.error("No code to format");
        try {
            const formatted = beautifyJs(content, { indent_size: 2 });
            setContent(formatted);
            toast.success("Code Formatted!");
        } catch (e) { toast.error("Failed to format code"); }
    };

    const handleMinify = async () => {
        if (!content) return toast.error("No code to minify");
        setIsMinifying(true);
        try {
            const result = await minifyTs(content, { ecma: 2015 });
            if (result.code) {
                setContent(result.code);
                toast.success("Code Minified!");
            }
        } catch (e: any) { toast.error(`Error: ${e.message}`); }
        finally { setIsMinifying(false); }
    };

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Run Button - Primary Action */}
            <button
                onClick={onRun}
                className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-semibold transition-colors shadow-sm"
            >
                <Play size={14} fill="currentColor" /> Run
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Utility Buttons - Secondary Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleFormat}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all"
                >
                    <Wand2 size={14} /> Format
                </button>
                <button
                    onClick={handleMinify}
                    disabled={isMinifying}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all disabled:opacity-50"
                >
                    {isMinifying ? <Loader2 size={14} className="animate-spin" /> : <Minimize2 size={14} />}
                    Minify
                </button>
            </div>
        </div>
    );
}