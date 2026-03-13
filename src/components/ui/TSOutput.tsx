"use client";

import { useState } from "react";
import { FileCode, Terminal } from "lucide-react";
import { LogEntry } from "./JsConsole"; // Reuse type from JS Console
import JsConsole from "./JsConsole"; // Reuse Console component

interface Props {
    logs: LogEntry[];
    compiledCode: string;
    onClear: () => void;
}

export default function TSOutput({ logs, compiledCode, onClear }: Props) {
    const [activeTab, setActiveTab] = useState<"console" | "compiled">("console");

    return (
        <div className="h-full w-full flex flex-col bg-zinc-900 text-zinc-100 font-mono text-sm">
            {/* Tabs Header */}
            <div className="flex items-center gap-4 px-4 border-b border-zinc-700 bg-zinc-800/50">
                <button
                    onClick={() => setActiveTab("console")}
                    className={`flex items-center gap-2 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'console'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                >
                    <Terminal size={14} /> Console
                </button>
                <button
                    onClick={() => setActiveTab("compiled")}
                    className={`flex items-center gap-2 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === 'compiled'
                            ? 'text-blue-400 border-blue-400'
                            : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                >
                    <FileCode size={14} /> Compiled JS
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === "console" ? (
                    <JsConsole logs={logs} onClear={onClear} />
                ) : (
                    <div className="h-full w-full overflow-auto p-4">
                        <pre className="whitespace-pre-wrap text-zinc-200">
                            {compiledCode || "// Compiled JavaScript will appear here after running"}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}