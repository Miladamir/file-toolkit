"use client";

import { forwardRef } from "react";
import { useFileStore } from "@/store/editorStore";

interface Props {
    placeholder?: string;
}

// We use forwardRef so the parent component can access the underlying textarea DOM element
const SimpleTextarea = forwardRef<HTMLTextAreaElement, Props>(({ placeholder }, ref) => {
    const { content, setContent } = useFileStore();

    return (
        <textarea
            ref={ref} // Pass the ref here
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || "Start typing here..."}
            spellCheck={false}
            className="code-area"
            style={{
                resize: 'none',
                outline: 'none',
                height: '100%',
                width: '100%',
                padding: '2rem',
            }}
        />
    );
});

SimpleTextarea.displayName = "SimpleTextarea";
export default SimpleTextarea;