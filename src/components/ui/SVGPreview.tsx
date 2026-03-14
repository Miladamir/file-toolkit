"use client";

import { useEffect, useState } from "react";

interface Props {
    content: string;
    background: "trans" | "white" | "dark";
}

export default function SvgPreview({ content, background }: Props) {
    const [srcDoc, setSrcDoc] = useState("");

    useEffect(() => {
        // We wrap the SVG in a flex container to center it
        const html = `
            <html>
                <head>
                    <style>
                        html, body { margin: 0; height: 100%; display: flex; align-items: center; justify-content: center; }
                        svg { max-width: 100%; max-height: 100%; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `;
        setSrcDoc(html);
    }, [content]);

    // Dynamic classes for background
    const bgClass = {
        trans: "bg-[url('/checkerboard.svg')]", // We will simulate this with CSS gradient inline
        white: "bg-white",
        dark: "bg-zinc-800",
    }[background];

    // Inline style for checkerboard pattern to avoid external asset dependency
    const checkerStyle = background === 'trans' ? {
        backgroundImage: "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
    } : {};

    return (
        <div className={`h-full w-full overflow-auto ${bgClass}`} style={checkerStyle}>
            <iframe
                srcDoc={srcDoc}
                title="SVG Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-none bg-transparent"
            />
        </div>
    );
}