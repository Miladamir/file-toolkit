"use client";

import { useRef, useState, DragEvent, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import XmlTreePreview from "@/components/ui/XmlTreePreview";
import XMLActions from "@/components/tools/XMLActions";
import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

export default function XmlToolPage() {
    const { content, filename, setFileAuto } = useFileStore();
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [jsonOutput, setJsonOutput] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showDropZone = !content || content.trim() === "";

    // --- Drag & Drop ---
    const handleDragEnter = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };
    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => setFileAuto(file.name, e.target?.result as string);
        reader.readAsText(file);
    };

    // --- XML to JSON Logic ---
    const convertToJson = useCallback(() => {
        if (!content) return;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/xml");
            const error = doc.querySelector('parsererror');
            if (error) throw new Error("Invalid XML");

            const json = xmlToJson(doc.documentElement);
            setJsonOutput(JSON.stringify(json, null, 2));
            setIsModalOpen(true);
        } catch (e: any) {
            toast.error(`Conversion Error: ${e.message}`);
        }
    }, [content]);

    // Recursive XML to JS Object converter
    const xmlToJson = (node: Element): any => {
        let obj: any = {};

        // Handle attributes
        if (node.attributes.length > 0) {
            obj["@attributes"] = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                obj["@attributes"][attr.nodeName] = attr.nodeValue;
            }
        }

        // Handle children
        if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const item = node.childNodes[i];

                if (item.nodeType === Node.TEXT_NODE) {
                    const text = item.textContent?.trim();
                    if (text) {
                        // If it's just a text node with no siblings or attrs, return text directly
                        if (node.childNodes.length === 1 && node.attributes.length === 0) return text;
                        obj["#text"] = text;
                    }
                } else if (item.nodeType === Node.ELEMENT_NODE) {
                    const nodeName = item.nodeName;

                    if (typeof obj[nodeName] === "undefined") {
                        obj[nodeName] = xmlToJson(item as Element);
                    } else {
                        if (!Array.isArray(obj[nodeName])) {
                            const old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(xmlToJson(item as Element));
                    }
                }
            }
        }
        return obj;
    };

    const EditorContent = (
        <div className="relative w-full h-full" onDragEnter={handleDragEnter} onDragOver={(e) => e.preventDefault()} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {(showDropZone || isDragging) && (
                <div className={`drop-zone-container ${!showDropZone && !isDragging ? 'hidden' : ''}`}>
                    <div className={`drop-zone-box ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)]' : ''}`} onClick={() => fileInputRef.current?.click()}>
                        <div className="drop-icon-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--accent)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
                        <div className="drop-title">Drop XML file here</div>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".xml" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
            )}
            <CodeMirrorEditor language="xml" />
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online XML Editor & Viewer</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Visual Tree View</h3>
                    <p className="text-[var(--fg-secondary)]">Parse and visualize complex XML structures with a collapsible tree view. Detect validation errors instantly.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Convert to JSON</h3>
                    <p className="text-[var(--fg-secondary)]">Transform legacy XML data into modern JSON format with a single click. Useful for API migration and data modernization.</p>
                </div>
            </div>
        </>
    );

    return (
        <>
            <ToolPageLayout
                title="XML Editor"
                filename={filename || "data.xml"}
                defaultFilename="data.xml"
                extension="xml"
                toolId="xml"
                toolbarSlot={<XMLActions onConvert={convertToJson} />}
                editorSlot={EditorContent}
                previewSlot={<XmlTreePreview content={content} />}
                seoContent={SeoContent}
                onCopy={() => { navigator.clipboard.writeText(content); toast.success("Copied!"); }}
                onDownload={() => {
                    const blob = new Blob([content], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = filename || "data.xml"; a.click();
                }}
            />

            {/* JSON Output Modal */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[var(--bg)] rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden focus:outline-none p-6 flex flex-col max-h-[80vh]">
                        <Dialog.Title className="text-lg font-bold text-[var(--fg)] mb-4">Converted JSON</Dialog.Title>
                        <div className="flex-1 overflow-auto bg-[var(--bg-secondary)] p-4 rounded-md font-mono text-sm border border-[var(--border)]">
                            <pre className="whitespace-pre-wrap break-words text-[var(--fg)]">{jsonOutput}</pre>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm font-medium hover:bg-[var(--bg)] transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(jsonOutput);
                                    toast.success("JSON Copied!");
                                }}
                                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                            >
                                Copy JSON
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}