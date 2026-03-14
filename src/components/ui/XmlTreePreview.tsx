"use client";

import { useMemo } from "react";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Props {
    content: string;
}

// Recursive Component for XML Tree
const XmlNode = ({ node, depth = 0 }: { node: Element | Node; depth?: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 2);

    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (!text) return null;
        return <span className="text-[var(--fg)] ml-2">{text}</span>;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const hasChildren = element.children.length > 0 || (element.childNodes.length > 0 && Array.from(element.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()));

    const attrs = Array.from(element.attributes).map(attr =>
        <span key={attr.name} className="text-[var(--fg-secondary)] ml-1">
            <span className="text-orange-500 dark:text-orange-400">{attr.name}</span>=<span className="text-green-600 dark:text-green-400">"{attr.value}"</span>
        </span>
    );

    return (
        <div className="font-mono text-sm ml-4 border-l border-[var(--border)] pl-2 py-0.5">
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-[var(--bg-secondary)] rounded px-1 group"
                onClick={() => setIsOpen(!isOpen)}
            >
                {hasChildren && (
                    <span className="text-[var(--fg-secondary)] w-4 h-4 flex items-center justify-center">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                )}

                {!hasChildren && <span className="w-4 h-4"></span>}

                <span className="text-orange-600 dark:text-orange-400 font-medium">&lt;{element.nodeName}</span>
                {attrs}

                {!hasChildren && <span className="text-orange-600 dark:text-orange-400 font-medium">/&gt;</span>}

                {hasChildren && <span className="text-orange-600 dark:text-orange-400 font-medium">&gt;</span>}
            </div>

            {isOpen && hasChildren && (
                <div className="mt-1">
                    {Array.from(element.childNodes).map((child, i) => (
                        <XmlNode key={i} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}

            {isOpen && hasChildren && (
                <div className="ml-1 group">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">&lt;/{element.nodeName}&gt;</span>
                </div>
            )}
        </div>
    );
};

export default function XmlTreePreview({ content }: Props) {
    const parsed = useMemo(() => {
        if (!content) return { error: null, doc: null };

        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/xml");
        const errorNode = doc.querySelector('parsererror');

        if (errorNode) {
            // Try to extract meaningful error message
            return { error: errorNode.textContent || "Invalid XML", doc: null };
        }

        return { error: null, doc };
    }, [content]);

    if (!content) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)]">
                Paste XML to see the tree view
            </div>
        );
    }

    if (parsed.error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-red-500 dark:text-red-400 text-center">
                <AlertCircle size={32} className="mb-4 opacity-50" />
                <div className="font-bold mb-2">Invalid XML</div>
                <div className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-4 rounded overflow-auto max-w-full">
                    {parsed.error.split('\n')[0]} {/* Show first line of error */}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-auto p-6 bg-[var(--bg-secondary)]">
            <div className="text-xs uppercase tracking-wider text-[var(--fg-secondary)] mb-4 font-sans font-bold">Structure</div>
            {parsed.doc && <XmlNode node={parsed.doc.documentElement} />}
        </div>
    );
}