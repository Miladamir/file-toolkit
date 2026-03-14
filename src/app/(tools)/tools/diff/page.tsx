"use client";

import { useState, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import DiffViewer from "@/components/ui/DiffViewer";
import DiffActions from "@/components/tools/DiffActions";
import { toast } from "sonner";
import { Panel, Group, Separator } from "react-resizable-panels";

export default function DiffToolPage() {
    // State for the two inputs
    const [original, setOriginal] = useState("");
    const [modified, setModified] = useState("");

    const handleCompare = useCallback(() => {
        if (!original && !modified) {
            toast.error("Please enter text in both fields");
            return;
        }
        // The preview is always live in this implementation via DiffViewer, 
        // but you could add a toggle here if needed.
    }, [original, modified]);

    const handleClear = () => {
        setOriginal("");
        setModified("");
    };

    const handleSwap = () => {
        const temp = original;
        setOriginal(modified);
        setModified(temp);
        toast.success("Inputs swapped");
    };

    // Editor Slot: Split pane with two CodeMirror editors
    const EditorContent = (
        <div className="h-full w-full">
            <Group orientation="horizontal">
                <Panel defaultSize={50} minSize={20}>
                    <div className="h-full w-full overflow-hidden border-r border-[var(--border)] flex flex-col">
                        <div className="px-4 py-2 bg-[var(--toolbar-bg)] border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">
                            Original Text
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeMirrorEditor
                                language="markdown"
                                placeholder="Paste original text here..."
                                value={original}
                                onChange={setOriginal}
                            />
                        </div>
                    </div>
                </Panel>

                <Separator />

                <Panel defaultSize={50} minSize={20}>
                    <div className="h-full w-full overflow-hidden flex flex-col">
                        <div className="px-4 py-2 bg-[var(--toolbar-bg)] border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider">
                            Modified Text
                        </div>
                        <div className="flex-1 min-h-0">
                            <CodeMirrorEditor
                                language="markdown"
                                placeholder="Paste modified text here..."
                                value={modified}
                                onChange={setModified}
                            />
                        </div>
                    </div>
                </Panel>
            </Group>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online Diff Checker</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Compare Text & Code</h3>
                    <p className="text-[var(--fg-secondary)]">Find differences between two blocks of text or code. Ideal for spotting changes in configuration files, logs, or code snippets.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Instant Highlighting</h3>
                    <p className="text-[var(--fg-secondary)]">Added lines are highlighted in green, removed lines in red. Quickly identify what has changed.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Diff Checker"
            filename="compare.diff"
            defaultFilename="compare.diff"
            extension="diff"
            toolId="diff"
            toolbarSlot={<DiffActions onCompare={handleCompare} onClear={handleClear} onSwap={handleSwap} />}
            editorSlot={EditorContent}
            previewSlot={<DiffViewer original={original} modified={modified} />}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(`Original:\n${original}\n\nModified:\n${modified}`); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([`Original:\n${original}\n\nModified:\n${modified}`], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "comparison.txt"; a.click();
            }}
        />
    );
}