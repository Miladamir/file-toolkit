"use client";

import { useFileStore } from "@/store/editorStore";
import { useState, useEffect } from "react";

interface Props {
    isLive: boolean;
}

export default function HtmlPreview({ isLive }: Props) {
    const { content } = useFileStore();
    const [displayContent, setDisplayContent] = useState(content);

    useEffect(() => {
        if (isLive) {
            setDisplayContent(content);
        }
    }, [content, isLive]);

    return (
        // No wrapper div with padding/overflow. Just the iframe.
        // The parent (ToolPageLayout) handles the overflow-auto.
        <iframe
            srcDoc={displayContent}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full bg-white"
        />
    );
}