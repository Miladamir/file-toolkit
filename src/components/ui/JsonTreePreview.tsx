"use client";

import { useFileStore } from "@/store/editorStore";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

// Recursive Component for JSON Tree
const JsonNode = ({ data, name, depth = 0 }: { data: any; name?: string; depth?: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand first 2 levels

    const isObject = typeof data === 'object' && data !== null;
    const isArray = Array.isArray(data);

    const getNodeColor = (val: any) => {
        if (typeof val === 'string') return 'text-teal-600 dark:text-teal-400';
        if (typeof val === 'number') return 'text-blue-600 dark:text-blue-400';
        if (typeof val === 'boolean') return 'text-amber-600 dark:text-amber-400';
        if (val === null) return 'text-gray-500 dark:text-gray-400 italic';
        return 'text-[var(--fg)]';
    };

    const renderValue = (val: any) => {
        if (typeof val === 'string') return `"${val}"`;
        return String(val);
    };

    // Count children for summary
    const childCount = isObject ? Object.keys(data).length : 0;

    if (!isObject) {
        return (
            <div className="flex items-center gap-2 font-mono text-sm" style={{ marginLeft: `${depth * 1.5}rem` }}>
                {name && <span className="text-[var(--fg)] font-medium">"{name}": </span>}
                <span className={getNodeColor(data)}>{renderValue(data)}</span>
            </div>
        );
    }

    return (
        <div className="font-mono text-sm">
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-[var(--bg-secondary)] rounded px-1 py-0.5 group"
                style={{ marginLeft: `${depth * 1.5}rem` }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="w-4 h-4 flex items-center justify-center text-[var(--fg-secondary)]">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>

                {name && <span className="text-[var(--fg)] font-medium">"{name}": </span>}

                <span className="text-[var(--fg-secondary)] text-xs">
                    {isArray ? `[${childCount} items]` : `{${childCount} keys}`}
                </span>
            </div>

            {isOpen && (
                <div className="border-l border-[var(--border)] ml-3 pl-1">
                    {Object.keys(data).map((key) => (
                        <JsonNode
                            key={key}
                            name={isArray ? undefined : key}
                            data={data[key]}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function JsonTreePreview() {
    const { content } = useFileStore();
    const [error, setError] = useState<string | null>(null);

    // Parse JSON safely
    const parsedData = useMemo(() => {
        if (!content) return null;
        try {
            setError(null);
            return JSON.parse(content);
        } catch (e: any) {
            setError(e.message);
            return null;
        }
    }, [content]);

    if (!content) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)]">
                Paste JSON to see the tree view
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-red-500 dark:text-red-400">
                <div className="font-bold mb-2">Invalid JSON</div>
                <div className="text-sm font-mono bg-red-50 dark:bg-red-900/20 p-4 rounded">{error}</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-auto p-6 bg-[var(--bg-secondary)]">
            <div className="mb-4 flex items-center gap-2 text-xs text-[var(--fg-secondary)] font-sans border-b border-[var(--border)] pb-2">
                <span className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">String</span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Number</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">Boolean</span>
            </div>

            <div className="json-tree">
                <JsonNode data={parsedData} />
            </div>
        </div>
    );
}