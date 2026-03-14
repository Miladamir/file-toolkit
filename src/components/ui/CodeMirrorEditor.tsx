"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap, drawSelection, highlightActiveLine, highlightActiveLineGutter, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from "@codemirror/language";
import { search, searchKeymap } from "@codemirror/search";
import { markdown } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { sql } from "@codemirror/lang-sql";
import { python } from "@codemirror/lang-python";
import { php } from "@codemirror/lang-php";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { useFileStore } from "@/store/editorStore";

// Define a simple highlight style for plain text (optional, mostly for consistency)
const plainTextHighlight = syntaxHighlighting(defaultHighlightStyle, { fallback: true });

const languageMap: Record<string, any> = {
    markdown: markdown(),
    html: html(),
    css: css(),
    json: json(),
    javascript: javascript(),
    typescript: javascript({ typescript: true }),
    xml: xml(),
    yaml: yaml(),
    csv: [],
    sql: sql(),
    python: python(),
    php: php(),
    java: java(),
    cpp: cpp(),
    c: cpp(),
};

interface EditorStats {
    lines: number;
    words: number;
    chars: number;
    cursorLine: number;
    cursorCol: number;
    selectedChars: number;
}

interface Props {
    language?: keyof typeof languageMap;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    // New Props for Text Editor
    showLineNumbers?: boolean;
    wordWrap?: boolean;
    onStatsChange?: (stats: EditorStats) => void;
}

export default function CodeMirrorEditor({
    language = "markdown", placeholder, value, onChange,
    showLineNumbers = true, wordWrap = true, onStatsChange
}: Props) {

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    const setContentGlobal = useFileStore((state) => state.setContent);
    const contentGlobal = useFileStore((state) => state.content);

    const currentContent = value !== undefined ? value : contentGlobal;
    const handleChange = onChange || setContentGlobal;

    // Calculate stats helper
    const calculateStats = useCallback((view: EditorView) => {
        const doc = view.state.doc;
        const selection = view.state.selection;

        const chars = doc.length;
        const lines = doc.lines;
        const text = doc.toString();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;

        // Cursor position
        const pos = selection.main.head;
        const cursorLine = doc.lineAt(pos).number;
        const cursorCol = pos - doc.lineAt(pos).from;

        // Selection
        let selectedChars = 0;
        selection.ranges.forEach(r => selectedChars += r.to - r.from);

        if (onStatsChange) {
            onStatsChange({ lines, words, chars, cursorLine, cursorCol, selectedChars });
        }
    }, [onStatsChange]);

    useEffect(() => {
        if (!editorRef.current) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                handleChange(update.state.doc.toString());
            }
            if (update.docChanged || update.selectionSet) {
                calculateStats(update.view);
            }
        });

        // Dynamic extensions
        const extensions: Extension[] = [
            history(),
            drawSelection(),
            EditorState.allowMultipleSelections.of(true),
            keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
            languageMap[language] || [],
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            updateListener,
            search({ top: true }), // Enable search panel
            // Theme
            EditorView.theme({
                "&": { backgroundColor: "transparent !important", height: "100%" },
                ".cm-scroller": { fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: "1.6", overflow: "auto" },
                ".cm-content": { padding: "2rem 2.5rem", caretColor: "var(--accent)" },
                "&.cm-focused .cm-cursor": { borderLeftColor: "var(--accent)" },
                "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "var(--accent-light) !important" },
                ".cm-line": { padding: "0" },
                ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--fg-secondary)" },
                ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--fg)" },
                ".cm-search": { background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "4px 8px", borderRadius: "4px", position: "absolute", top: "4px", right: "4px", zIndex: 100 }
            }),
        ];

        // Conditional extensions
        if (showLineNumbers) extensions.push(lineNumbers());
        if (wordWrap) extensions.push(EditorView.lineWrapping);

        const startState = EditorState.create({
            doc: currentContent,
            extensions,
        });

        const view = new EditorView({ state: startState, parent: editorRef.current });
        viewRef.current = view;

        // Initial stats
        calculateStats(view);

        return () => view.destroy();
    }, [language, showLineNumbers, wordWrap, calculateStats]); // Re-initialize if view settings change

    // Sync external value
    useEffect(() => {
        if (viewRef.current) {
            const viewContent = viewRef.current.state.doc.toString();
            if (currentContent !== viewContent) {
                viewRef.current.dispatch({
                    changes: { from: 0, to: viewContent.length, insert: currentContent }
                });
            }
        }
    }, [currentContent]);

    return <div ref={editorRef} className="w-full h-full overflow-hidden bg-transparent" style={{ height: "100%" }} />;
}