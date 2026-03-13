"use client";

import { useFileStore } from "@/store/editorStore";
import yaml from "js-yaml";
import { toast } from "sonner";
import { Wand2, ArrowRightLeft } from "lucide-react";

export default function YAMLActions() {
    const { content, setContent, setFileAuto, filename } = useFileStore();

    const handleFormat = () => {
        if (!content) {
            toast.error("No YAML to format");
            return;
        }
        try {
            // Load YAML and dump it back out to format/standardize
            const doc = yaml.load(content);
            const formatted = yaml.dump(doc, { indent: 2, lineWidth: -1 });
            setContent(formatted);
            toast.success("YAML Formatted!");
        } catch (e: any) {
            toast.error(`Invalid YAML: ${e.message}`);
        }
    };

    const handleConvertToJSON = () => {
        if (!content) {
            toast.error("No YAML to convert");
            return;
        }
        try {
            const doc = yaml.load(content);
            const jsonContent = JSON.stringify(doc, null, 2);

            // Update content AND change the file extension in the store
            const newName = filename.replace(/\.(ya?ml)$/i, ".json");
            setFileAuto(newName || "converted.json", jsonContent);

            toast.success("Converted to JSON!");
        } catch (e: any) {
            toast.error(`Conversion Failed: ${e.message}`);
        }
    };

    return (
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-2">
            <button
                onClick={handleFormat}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Format YAML"
            >
                <Wand2 className="h-3.5 w-3.5" />
                Format
            </button>
            <button
                onClick={handleConvertToJSON}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Convert to JSON"
            >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                To JSON
            </button>
        </div>
    );
}