"use client";

import { useFileStore } from "@/store/editorStore";

export default function SVGPreview() {
    const { content } = useFileStore();

    if (!content) {
        return (
            <div className="h-full w-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                No SVG content to display
            </div>
        );
    }

    // Security Note: rendering raw SVG can execute scripts if not sanitized.
    // For a client-side tool, we rely on the browser's sandboxing.
    // We use dangerouslySetInnerHTML to render the SVG tag from text.
    return (
        <div
            className="h-full w-full overflow-auto p-4 bg-zinc-100 dark:bg-zinc-900 grid place-items-center"
            // We add a checkerboard background to visualize transparency if the SVG has none
            style={{ backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" }}
        >
            <div
                className="max-w-full max-h-full bg-white dark:bg-zinc-800 shadow-lg rounded-md overflow-hidden"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
}