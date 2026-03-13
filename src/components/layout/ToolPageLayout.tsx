"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Copy, Download, Sun, Moon, Columns, Rows, Maximize2, Minimize2 } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { useFileStore } from "@/store/editorStore";

interface ToolPageLayoutProps {
    title: string;
    filename: string; // The dynamic filename from the store (for display)
    defaultFilename: string; // The hardcoded fallback name (for reset logic)
    extension: string;
    toolId: string;
    toolbarSlot?: ReactNode;
    editorSlot: ReactNode;
    previewSlot: ReactNode;
    seoContent: ReactNode;
    onCopy: () => void;
    onDownload: () => void;
    extraActions?: ReactNode;
    previewControls?: ReactNode;
}

export default function ToolPageLayout({
    title, filename, defaultFilename, extension, toolId, toolbarSlot, editorSlot, previewSlot, seoContent, onCopy, onDownload, extraActions, previewControls
}: ToolPageLayoutProps) {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();
    const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");

    const [layoutDirection, setLayoutDirection] = useState<"horizontal" | "vertical">("horizontal");
    const [fullscreenPane, setFullscreenPane] = useState<'none' | 'editor' | 'preview'>('none');

    // --- Memory Reset Logic ---
    const { setActiveTool } = useFileStore();

    useEffect(() => {
        // Use defaultFilename here, NOT the dynamic filename prop
        setActiveTool(toolId, defaultFilename, extension);
    }, [toolId, defaultFilename, extension, setActiveTool]);

    useEffect(() => setMounted(true), []);

    const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
    const toggleLayout = () => setLayoutDirection(prev => prev === "horizontal" ? "vertical" : "horizontal");

    const openFullscreen = (pane: 'editor' | 'preview') => setFullscreenPane(pane);
    const closeFullscreen = () => setFullscreenPane('none');

    if (fullscreenPane !== 'none') {
        return (
            <div className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col">
                <div className="h-12 border-b border-[var(--border)] flex items-center justify-between px-4 bg-[var(--bg-secondary)] flex-shrink-0">
                    <span className="font-semibold text-[var(--fg)]">
                        {fullscreenPane === 'editor' ? 'Editor' : 'Preview'} Mode
                    </span>
                    <button onClick={closeFullscreen} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent)] text-white rounded-md text-sm font-medium hover:opacity-90">
                        <Minimize2 size={14} /> Exit
                    </button>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                    {fullscreenPane === 'editor' ? editorSlot : previewSlot}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[var(--bg)]">

            {/* Header */}
            <header className="app-header flex-shrink-0 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="header-left">
                    <Link href="/tools" className="back-btn"><ArrowLeft size={18} /></Link>
                    <div className="tool-info">
                        <h1>{title}</h1>
                        <span>{filename}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={onCopy}><Copy size={16} /><span>Copy</span></button>
                    {extraActions}
                    <button className="btn-icon btn-primary" onClick={onDownload}><Download size={16} /><span>Download</span></button>
                </div>
            </header>

            {/* Editor Container */}
            <div className="h-[75vh] min-h-[500px] flex flex-col overflow-hidden border-b border-[var(--border)]">

                {/* Toolbar */}
                <div className="toolbar flex-shrink-0">
                    {toolbarSlot}
                    <div className="toolbar-group" style={{ border: "none", marginLeft: 'auto' }}>
                        <button className="tool-btn" title="Switch Layout" onClick={toggleLayout}>
                            {layoutDirection === 'horizontal' ? <Rows size={16} /> : <Columns size={16} />}
                        </button>
                        {previewControls}
                        {mounted && (
                            <button onClick={toggleTheme} className="theme-toggle-editor">
                                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Resizable Area */}
                <div className="flex-1 overflow-hidden min-h-0">
                    <div className="hidden md:flex h-full">
                        <Group orientation={layoutDirection}>
                            <Panel defaultSize={50} minSize={20}>
                                <div className="h-full w-full overflow-auto relative bg-[var(--editor-bg)] border-r border-[var(--border)]">
                                    <button onClick={() => openFullscreen('editor')} className="absolute top-3 right-3 z-20 p-1.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors" title="Fullscreen Editor">
                                        <Maximize2 size={14} />
                                    </button>
                                    {editorSlot}
                                </div>
                            </Panel>

                            <Separator />

                            <Panel defaultSize={50} minSize={20}>
                                <div className="h-full w-full overflow-auto relative bg-[var(--preview-bg)]">
                                    <button onClick={() => openFullscreen('preview')} className="absolute top-3 right-3 z-20 p-1.5 rounded bg-white dark:bg-zinc-800 shadow-sm hover:opacity-80 transition-colors" title="Fullscreen Preview">
                                        <Maximize2 size={14} />
                                    </button>
                                    {previewSlot}
                                </div>
                            </Panel>
                        </Group>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="md:hidden h-full relative">
                        <div className={`absolute inset-0 overflow-auto ${mobileTab === 'editor' ? 'z-10 bg-[var(--editor-bg)]' : 'hidden'}`}>
                            {editorSlot}
                        </div>
                        <div className={`absolute inset-0 overflow-auto ${mobileTab === 'preview' ? 'z-10 bg-[var(--preview-bg)]' : 'hidden'}`}>
                            {previewSlot}
                        </div>
                    </div>
                </div>

                <div className="mobile-tabs md:hidden flex-shrink-0">
                    <button className={`tab-btn ${mobileTab === 'editor' ? 'active' : ''}`} onClick={() => setMobileTab('editor')}>Editor</button>
                    <button className={`tab-btn ${mobileTab === 'preview' ? 'active' : ''}`} onClick={() => setMobileTab('preview')}>Preview</button>
                </div>
            </div>

            {/* SEO Content Section */}
            <section className="w-full py-12 px-4 md:px-8 bg-[var(--bg)]">
                <div className="max-w-4xl mx-auto">
                    {seoContent}
                </div>
            </section>

        </div>
    );
}