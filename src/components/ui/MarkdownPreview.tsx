"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { useFileStore } from "@/store/editorStore";

export default function MarkdownPreview() {
    const { content } = useFileStore();

    return (
        // Added padding and overflow here specifically for Markdown
        <div className="h-full w-full overflow-auto p-8 md:p-12">
            <div className="markdown-body max-w-3xl mx-auto">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}