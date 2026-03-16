"use client";

import { useState, useEffect, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import {
    Clock,
    Calendar,
    ArrowRight,
    Copy,
    Download,
    Timer,
    Globe,
    Layers
} from "lucide-react";

export default function TimestampPage() {
    // Live Clock State
    const [now, setNow] = useState(Date.now());

    // Input State
    const [unixInput, setUnixInput] = useState("");
    const [humanInput, setHumanInput] = useState("");

    // Update live clock every 100ms
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 100);
        return () => clearInterval(timer);
    }, []);

    // Initialize Human Input to "Now" on mount
    useEffect(() => {
        setHumanInput(format(now, "yyyy-MM-dd'T'HH:mm"));
    }, []); // Run once

    // --- Conversion Logic ---

    // Unix -> Human
    const unixResult = useMemo(() => {
        if (!unixInput) return null;
        // Auto-detect seconds vs milliseconds
        // If input length is > 10, assume milliseconds (valid until year 2286)
        let timestamp = parseInt(unixInput);
        if (isNaN(timestamp)) return null;

        if (unixInput.length <= 10) {
            timestamp *= 1000;
        }

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return null;

        return {
            local: format(date, "PPpp"),
            utc: format(date, "PPpp 'UTC'"), // simplified UTC format
            relative: formatDistanceToNow(date, { addSuffix: true })
        };
    }, [unixInput]);

    // Human -> Unix
    const humanResult = useMemo(() => {
        if (!humanInput) return null;
        const date = new Date(humanInput);
        if (isNaN(date.getTime())) return null;

        return {
            seconds: Math.floor(date.getTime() / 1000),
            milliseconds: date.getTime(),
            relative: formatDistanceToNow(date, { addSuffix: true })
        };
    }, [humanInput]);

    // --- Handlers ---

    const setHumanToNow = () => {
        setHumanInput(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const downloadResults = () => {
        const content = `
Timestamp Conversion Results
===========================
Current Time: ${now}
Seconds: ${Math.floor(now / 1000)}
Milliseconds: ${now}

Unix to Human
-------------
Input: ${unixInput || "-"}
Local: ${unixResult?.local || "-"}
UTC: ${unixResult?.utc || "-"}

Human to Unix
-------------
Input: ${humanInput || "-"}
Seconds: ${humanResult?.seconds || "-"}
Milliseconds: ${humanResult?.milliseconds || "-"}
        `.trim();

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timestamp.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center gap-4 h-full w-full font-mono text-xs">
            <span className="text-[var(--fg-secondary)]">Seconds:</span>
            <span className="text-[var(--accent)] font-bold">{Math.floor(now / 1000)}</span>
            <span className="text-[var(--fg-secondary)] ml-4">ms:</span>
            <span className="text-[var(--accent)] font-bold">{now}</span>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] overflow-auto">
            {/* Unix to Human */}
            <div className="p-4 border-b border-[var(--border)]">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2 mb-2">
                    <Clock size={12} /> Unix to Human
                </label>
                <input
                    type="number"
                    value={unixInput}
                    onChange={(e) => setUnixInput(e.target.value)}
                    placeholder="e.g. 1672531200"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-sky-500"
                />
                <p className="text-[10px] text-[var(--fg-secondary)] mt-1">Auto-detects seconds or milliseconds.</p>
            </div>

            {/* Human to Unix */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2">
                        <Calendar size={12} /> Human to Unix
                    </label>
                    <button onClick={setHumanToNow} className="text-[10px] text-sky-600 hover:underline">Set Now</button>
                </div>
                <input
                    type="datetime-local"
                    value={humanInput}
                    onChange={(e) => setHumanInput(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                />
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">

            {/* Live Clock Hero */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-950/50 dark:to-blue-900/30 p-6 text-center border-b border-[var(--border)]">
                <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2">Current Unix Timestamp</div>
                <div className="text-4xl font-bold text-sky-700 dark:text-sky-300 font-mono">
                    {Math.floor(now / 1000)}
                </div>
                <div className="text-xs text-sky-500 dark:text-sky-400 mt-1 font-mono">
                    Milliseconds: {now}
                </div>
                <div className="flex justify-center gap-2 mt-3">
                    <button onClick={() => copyText(String(Math.floor(now / 1000)), "Seconds")} className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs border border-sky-200 dark:border-sky-800">Copy Secs</button>
                    <button onClick={() => copyText(String(now), "Milliseconds")} className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs border border-sky-200 dark:border-sky-800">Copy Ms</button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-4 p-4 flex-1">

                {/* Unix Result */}
                <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-3 flex items-center gap-2">
                        <ArrowRight size={12} /> Converted Date
                    </h3>
                    {unixResult ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--fg-secondary)]">Local:</span>
                                <span className="font-mono text-[var(--fg)]">{unixResult.local}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--fg-secondary)]">UTC:</span>
                                <span className="font-mono text-[var(--fg)]">{unixResult.utc}</span>
                            </div>
                            <div className="text-right text-sky-600 font-semibold text-xs mt-2">
                                {unixResult.relative}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-[var(--fg-secondary)] text-center py-4">Enter a timestamp</div>
                    )}
                </div>

                {/* Human Result */}
                <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border)]">
                    <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-3 flex items-center gap-2">
                        <Timer size={12} /> Converted Timestamp
                    </h3>
                    {humanResult ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--fg-secondary)]">Seconds:</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono text-[var(--fg)]">{humanResult.seconds}</span>
                                    <button onClick={() => copyText(String(humanResult.seconds), "Seconds")} className="text-sky-500 hover:text-sky-600"><Copy size={12} /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--fg-secondary)]">Millis:</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-mono text-[var(--fg)]">{humanResult.milliseconds}</span>
                                    <button onClick={() => copyText(String(humanResult.milliseconds), "Milliseconds")} className="text-sky-500 hover:text-sky-600"><Copy size={12} /></button>
                                </div>
                            </div>
                            <div className="text-right text-sky-600 font-semibold text-xs mt-2">
                                {humanResult.relative}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-[var(--fg-secondary)] text-center py-4">Select a date</div>
                    )}
                </div>

            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Unix Timestamp Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">What is Unix Time?</h3>
                    <p className="text-[var(--fg-secondary)]">Unix time is the number of seconds that have elapsed since January 1, 1970 (midnight UTC/GMT), not counting leap seconds.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Live Conversion</h3>
                    <p className="text-[var(--fg-secondary)]">Convert timestamps to human-readable dates in your local timezone and UTC. Supports both seconds and milliseconds precision.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Timestamp"
            filename="timestamp.txt"
            defaultFilename="timestamp.txt"
            extension="txt"
            toolId="timestamp"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => copyText(String(Math.floor(now / 1000)), "Timestamp")}
            onDownload={downloadResults}
        />
    );
}