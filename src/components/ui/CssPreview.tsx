"use client";

import { useFileStore } from "@/store/editorStore";
import { useEffect, useState } from "react";

export default function CssPreview() {
    const { content } = useFileStore();
    const [srcDoc, setSrcDoc] = useState("");

    useEffect(() => {
        // Define the HTML playground
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Base Reset for Preview */
                    body { font-family: sans-serif; padding: 2rem; background: #f0f0f0; display: flex; flex-direction: column; gap: 1rem; margin: 0; }
                    .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1, h3 { margin: 0 0 1rem 0; color: #333; }
                    p { margin: 0 0 1rem 0; color: #555; }
                    button { padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; border: 1px solid #ccc; background: #fff; }

                    /* User CSS is injected here */
                    ${content}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Hello World</h1>
                    <p>This is a paragraph of text inside a container. Edit the CSS on the left to see changes applied instantly.</p>
                    <button>Button</button>
                </div>
                <div class="container">
                    <h3>Card 2</h3>
                    <p>Another element to style.</p>
                </div>
            </body>
            </html>
        `;

        // Debounce to prevent flashing
        const timeout = setTimeout(() => setSrcDoc(html), 150);
        return () => clearTimeout(timeout);
    }, [content]);

    return (
        <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts"
            className="w-full h-full bg-white"
        />
    );
}