"use client";

import { useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

export interface LogLine {
    id: string;
    type: "stdout" | "stderr" | "system";
    content: string;
}

interface Props {
    logs: LogLine[];
    onClear: () => void;
    status: "loading" | "ready" | "error";
}

export default function PythonConsole({ logs, onClear, status }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

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
                {status === "loading" && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        Initializing Python Engine...
                    </div>
                )}

                {status === "error" && (
                    <div className="text-red-400">
                        Failed to load Python Engine. Check connection.
                    </div>
                )}

                {status === "ready" && logs.length === 0 && (
                    <div className="text-zinc-500 text-center py-8">
                        Python 3.9 Ready. Press "Run" to execute.
                    </div>
                )}

                {logs.map((log) => (
                    <div
                        key={log.id}
                        className={`py-1 whitespace-pre-wrap break-words ${log.type === 'stderr' ? 'text-red-400' :
                                log.type === 'system' ? 'text-blue-400 italic' :
                                    'text-zinc-200'
                            }`}
                    >
                        <span className="opacity-50 mr-2">&gt;</span>
                        {log.content}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}