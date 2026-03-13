"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export interface LogEntry {
    id: string;
    type: "log" | "error" | "warn" | "info";
    message: string;
}

interface Props {
    logs: LogEntry[];
    onClear: () => void;
}

export default function JsConsole({ logs, onClear }: Props) {
    return (
        <div className="h-full w-full flex flex-col bg-zinc-900 text-zinc-100 font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Console Output</span>
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                    <Trash2 size={12} /> Clear
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-4 space-y-1">
                {logs.length === 0 ? (
                    <div className="text-zinc-500 text-center py-8">Press "Run" to execute code</div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className={`py-1 border-b border-zinc-800 last:border-0 ${log.type === 'error' ? 'text-red-400' :
                                log.type === 'warn' ? 'text-amber-400' :
                                    'text-zinc-200'
                                }`}
                        >
                            <span className="opacity-50 mr-2">&gt;</span>
                            <pre className="whitespace-pre-wrap break-words inline">{log.message}</pre>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}