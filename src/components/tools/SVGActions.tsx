"use client";

import { useFileStore } from "@/store/editorStore";
import xmlFormat from "xml-formatter";
import { toast } from "sonner";
import { Wand2, Minimize2, Square, Circle, PenTool, Type } from "lucide-react";

// Simple minifier for XML/SVG
const minifyXml = (code: string) => {
    return code.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
};

export default function SVGActions() {
    const { content, setContent } = useFileStore();

    const handleFormat = () => {
        if (!content) return toast.error("No SVG to format");
        try {
            const formatted = xmlFormat(content, { indentation: "  ", collapseContent: true });
            setContent(formatted);
            toast.success("SVG Formatted!");
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        }
    };

    const handleMinify = () => {
        if (!content) return toast.error("No SVG to minify");
        try {
            const minified = minifyXml(content);
            setContent(minified);
            toast.success("SVG Minified!");
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        }
    };

    const insertText = (text: string) => {
        setContent(content + "\n" + text);
        toast.success("Shape inserted");
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Utilities */}
            <div className="flex items-center gap-2">
                <button onClick={handleFormat} className={btnClass}>
                    <Wand2 size={14} /> Format
                </button>
                <button onClick={handleMinify} className={btnClass}>
                    <Minimize2 size={14} /> Minify
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Shapes */}
            <div className="flex items-center gap-2">
                <button onClick={() => insertText('<rect x="10" y="10" width="100" height="100" fill="currentColor" />')} className={btnClass}>
                    <Square size={14} /> Rect
                </button>
                <button onClick={() => insertText('<circle cx="50" cy="50" r="50" fill="currentColor" />')} className={btnClass}>
                    <Circle size={14} /> Circle
                </button>
                <button onClick={() => insertText('<path d="M10 10 L100 10 L100 100 Z" fill="currentColor" />')} className={btnClass}>
                    <PenTool size={14} /> Path
                </button>
                <button onClick={() => insertText('<text x="10" y="50" font-size="20" fill="currentColor">Hello</text>')} className={btnClass}>
                    <Type size={14} /> Text
                </button>
            </div>
        </div>
    );
}