"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, drawSelection, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript"; // Import JS
import { useFileStore } from "@/store/editorStore";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { sql, StandardSQL } from "@codemirror/lang-sql";
import { python } from "@codemirror/lang-python";

const editorTheme = EditorView.theme({
    "&": { backgroundColor: "transparent !important", height: "100%" },
    ".cm-scroller": { fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: "1.6", overflow: "auto" },
    ".cm-content": { padding: "2rem 2.5rem", caretColor: "var(--accent)" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "var(--accent)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "var(--accent-light) !important" },
    ".cm-line": { padding: "0" },
    ".cm-gutters": { display: "none" }
}, { dark: false });

const languageMap: Record<string, any> = {
    markdown: markdown(),
    html: html(),
    css: css(),
    json: json(),
    javascript: javascript(), // Add JS
    typescript: javascript({ typescript: true }),
    xml: xml(),
    yaml: yaml(),
    csv: [],
    sql: sql(),
    python: python(),
};

interface Props {
    language: "markdown" | "html" | "css" | "json" | "javascript" | "typescript" | "xml" | "yaml" | "csv" | "sql" | "python"; // Update Type
    placeholder?: string;
}

export default function CodeMirrorEditor({ language, placeholder }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const setContent = useFileStore((state) => state.setContent);
    const content = useFileStore((state) => state.content);

    useEffect(() => {
        if (!editorRef.current) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                setContent(update.state.doc.toString());
            }
        });

        const startState = EditorState.create({
            doc: content,
            extensions: [
                history(),
                drawSelection(),
                EditorState.allowMultipleSelections.of(true),
                keymap.of([...defaultKeymap, ...historyKeymap]),
                languageMap[language] || [],
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                bracketMatching(),
                editorTheme,
                updateListener,
                EditorView.lineWrapping,
            ],
        });

        const view = new EditorView({ state: startState, parent: editorRef.current });
        viewRef.current = view;

        return () => view.destroy();
    }, [language]);

    useEffect(() => {
        if (viewRef.current) {
            const currentContent = viewRef.current.state.doc.toString();
            if (content !== currentContent) {
                viewRef.current.dispatch({
                    changes: { from: 0, to: currentContent.length, insert: content }
                });
            }
        }
    }, [content]);

    return <div ref={editorRef} className="w-full h-full overflow-hidden bg-transparent" style={{ height: "100%" }} />;
}