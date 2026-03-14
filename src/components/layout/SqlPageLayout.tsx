"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowLeft, Copy, Download, Sun, Moon } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";

interface SqlLayoutProps {
    title: string;
    filename: string;
    defaultFilename: string;
    extension: string;
    toolId: string;

    // Slots
    schemaSlot: ReactNode;
    editorSlot: ReactNode;
    resultsSlot: ReactNode;
    toolbarSlot: ReactNode;
    seoContent: ReactNode;

    // Actions
    onCopy: () => void;
    onDownload: () => void;
}

export default function SqlPageLayout({
    title, filename, defaultFilename, extension, toolId,
    schemaSlot, editorSlot, resultsSlot, toolbarSlot, seoContent,
    onCopy, onDownload
}: SqlLayoutProps) {

    const [mounted, setMounted] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => setMounted(true), []);
    const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

    return (
        <div className="flex flex-col h-screen bg-[var(--bg)] overflow-hidden">

            {/* --- Header --- */}
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
                    <button className="btn-icon btn-primary" onClick={onDownload}><Download size={16} /><span>Download</span></button>
                </div>
            </header>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="toolbar flex-shrink-0 bg-[var(--toolbar-bg)] border-b border-[var(--border)] h-[48px] flex items-center px-4">
                    {toolbarSlot}
                    <div className="flex items-center gap-2 ml-auto">
                        {mounted && (
                            <button onClick={toggleTheme} className="theme-toggle-editor">
                                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* --- 3-Panel Layout --- */}
                <div className="flex-1 overflow-hidden">
                    <Group orientation="horizontal">

                        {/* Left: Schema Sidebar */}
                        <Panel defaultSize={18} minSize={15} maxSize={25}>
                            <div className="h-full w-full overflow-auto bg-[var(--bg-secondary)] border-r border-[var(--border)]">
                                {schemaSlot}
                            </div>
                        </Panel>

                        <Separator />

                        {/* Middle: Editor */}
                        <Panel defaultSize={45} minSize={20}>
                            <div className="h-full w-full overflow-auto relative bg-[var(--editor-bg)]">
                                {editorSlot}
                            </div>
                        </Panel>

                        <Separator />

                        {/* Right: Results */}
                        <Panel defaultSize={37} minSize={20}>
                            <div className="h-full w-full overflow-auto relative bg-[var(--bg-secondary)]">
                                {resultsSlot}
                            </div>
                        </Panel>

                    </Group>
                </div>
            </div>

            {/* --- SEO Footer --- */}
            <div className="seo-footer flex-shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] max-h-[60px] hover:max-h-[2000px] transition-all duration-500 group">
                <div className="h-[60px] flex items-center justify-center gap-2 cursor-pointer text-[var(--fg-secondary)] group-hover:text-[var(--accent)]">
                    <span>Documentation & Features</span>
                </div>
                <div className="px-4 pb-8 max-w-4xl mx-auto text-[var(--fg-secondary)]">
                    {seoContent}
                </div>
            </div>
        </div>
    );
}