"use client";

import { useFileStore } from "@/store/editorStore";
import yaml from "js-yaml";
import { toast } from "sonner";
import { Wand2, Minimize2, ArrowRightLeft } from "lucide-react";

export default function YAMLActions() {
    const { content, setContent, filename, setFileAuto } = useFileStore();

    const handleFormat = () => {
        if (!content) return toast.error("No YAML to format");
        try {
            const doc = yaml.load(content);
            const formatted = yaml.dump(doc, { indent: 2, lineWidth: -1 });
            setContent(formatted);
            toast.success("YAML Formatted!");
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        }
    };

    const handleMinify = () => {
        if (!content) return toast.error("No YAML to minify");
        try {
            const doc = yaml.load(content);
            // Use flow level to make it compact
            const minified = yaml.dump(doc, { indent: 0, flowLevel: 0, condenseFlow: true });
            setContent(minified);
            toast.success("YAML Minified!");
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        }
    };

    const handleConvertToJSON = () => {
        if (!content) return toast.error("No YAML to convert");
        try {
            const doc = yaml.load(content);
            const jsonContent = JSON.stringify(doc, null, 2);

            // Update content AND filename
            const newName = filename.replace(/\.(ya?ml)$/i, ".json");
            setFileAuto(newName || "converted.json", jsonContent);

            toast.success("Converted to JSON!");
        } catch (e: any) {
            toast.error(`Conversion Failed: ${e.message}`);
        }
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            <div className="flex items-center gap-2">
                <button onClick={handleFormat} className={btnClass}>
                    <Wand2 size={14} /> Format
                </button>
                <button onClick={handleMinify} className={btnClass}>
                    <Minimize2 size={14} /> Minify
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            <div className="flex items-center gap-2">
                <button onClick={handleConvertToJSON} className={btnClass}>
                    <ArrowRightLeft size={14} /> To JSON
                </button>
            </div>
        </div>
    );
}