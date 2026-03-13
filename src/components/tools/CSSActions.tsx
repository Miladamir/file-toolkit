"use client";

import { useFileStore } from "@/store/editorStore";
import { css as beautifyCss } from "js-beautify";
import { minify as minifyCss } from "csso";
import { toast } from "sonner";
import { Wand2, Minimize2, LayoutGrid, Rows, Monitor, Sparkles } from "lucide-react";
import { useState } from "react";

export default function CSSActions() {
    const { content, setContent } = useFileStore();
    const [color, setColor] = useState("#2563eb");

    const handleFormat = () => {
        if (!content) return toast.error("No CSS to format");
        try {
            const formatted = beautifyCss(content, { indent_size: 2 });
            setContent(formatted);
            toast.success("CSS Formatted!");
        } catch (e) { toast.error("Failed to format CSS"); }
    };

    const handleMinify = () => {
        if (!content) return toast.error("No CSS to minify");
        try {
            const minified = minifyCss(content).css;
            setContent(minified);
            toast.success("CSS Minified!");
        } catch (e) { toast.error("Failed to minify CSS"); }
    };

    // Helper to append snippets
    const insertText = (text: string) => {
        // Add newline if editor isn't empty
        const newContent = content ? content + "\n" + text : text;
        setContent(newContent);
        toast.success("Snippet inserted");
    };

    // Helper to insert color at the end (or you could use cursor position logic if needed)
    const insertColor = () => {
        setContent(content + color);
        toast.success("Color inserted");
    };

    // Common button classes for consistency
    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Format & Minify */}
            <div className="flex items-center gap-2">
                <button onClick={handleFormat} className={btnClass}>
                    <Wand2 size={14} /> Format
                </button>
                <button onClick={handleMinify} className={btnClass}>
                    <Minimize2 size={14} /> Minify
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Snippets */}
            <div className="flex items-center gap-2">
                <button onClick={() => insertText("display: flex;\njustify-content: center;\nalign-items: center;")} className={btnClass}>
                    <Rows size={14} /> Flex
                </button>
                <button onClick={() => insertText("display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 1rem;")} className={btnClass}>
                    <LayoutGrid size={14} /> Grid
                </button>
                <button onClick={() => insertText("@media (max-width: 768px) {\n  \n}")} className={btnClass}>
                    <Monitor size={14} /> Media
                </button>
                <button onClick={() => insertText("@keyframes change {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}")} className={btnClass}>
                    <Sparkles size={14} /> Animate
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border border-[var(--border)] overflow-hidden"
                />
                <button onClick={insertColor} className={btnClass}>
                    Insert Color
                </button>
            </div>
        </div>
    );
}