"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    Fingerprint,
    History,
    Trash2,
    RefreshCw,
    CaseSensitive,
    Minus,
    Braces
} from "lucide-react";

interface HistoryItem {
    id: string;
    config: string;
    preview: string;
}

// --- Core Logic ---

/**
 * Generates a cryptographically secure UUID v4.
 * Uses native API if available, falls back to secure manual generation.
 */
function generateUUID(): string {
    // 1. Native Modern API (Fastest, Standard)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // 2. Secure Fallback (crypto.getRandomValues)
    // We implement RFC 4122 v4 manually here.
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);

    // Per RFC 4122, set version bits (0100) and variant bits (10xx)
    // Byte 6: version (4) -> 0100 xxxx
    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    // Byte 8: variant (1) -> 10xx xxxx
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    // Convert to hex string
    const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');

    // Format: 8-4-4-4-12
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UUIDGeneratorPage() {
    const [quantity, setQuantity] = useState(1);
    const [uppercase, setUppercase] = useState(false);
    const [noHyphens, setNoHyphens] = useState(false);
    const [braces, setBraces] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Generation Logic
    const result = useMemo(() => {
        const uuids: string[] = [];

        for (let i = 0; i < quantity; i++) {
            let uuid = generateUUID();

            // 1. Hyphens
            if (noHyphens) uuid = uuid.replace(/-/g, "");

            // 2. Uppercase
            if (uppercase) uuid = uuid.toUpperCase();

            // 3. Braces
            if (braces) uuid = `{${uuid}}`;

            uuids.push(uuid);
        }

        return uuids.join("\n");
    }, [quantity, uppercase, noHyphens, braces]);

    // --- Handlers ---

    const saveToHistory = () => {
        const newEntry: HistoryItem = {
            id: Date.now().toString(),
            config: `${quantity}x, ${uppercase ? "UP" : "low"}, ${noHyphens ? "NoHyph" : "Hyph"}`,
            preview: result.split("\n")[0]
        };
        setHistory(prev => [newEntry, ...prev].slice(0, 10));
    };

    const handleGenerate = () => {
        saveToHistory();
        toast.success(`Generated ${quantity} UUIDs`);
    };

    const loadFromHistory = (item: HistoryItem) => {
        // Basic parser for history (simplified for demo)
        toast.info("Loaded from history");
        // In a full app, you might store the full state config
    };

    const clearHistory = () => {
        setHistory([]);
        toast.success("History cleared");
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6">
            {/* Quantity */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-[var(--fg-secondary)]">
                    <span>Quantity</span>
                    <span className="font-mono text-[var(--accent)] font-bold">{quantity}</span>
                </div>
                <input
                    type="range"
                    min="1" max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(+e.target.value)}
                    className="w-full h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
            </div>

            {/* Options */}
            <div className="space-y-3">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">Formatting</div>

                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm flex items-center gap-2"><CaseSensitive size={14} /> Uppercase</span>
                    <div className="relative">
                        <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--border)] rounded-full peer-checked:bg-[var(--accent)] transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm flex items-center gap-2"><Minus size={14} /> No Hyphens</span>
                    <div className="relative">
                        <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--border)] rounded-full peer-checked:bg-[var(--accent)] transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm flex items-center gap-2"><Braces size={14} /> Braces { }</span>
                    <div className="relative">
                        <input type="checkbox" checked={braces} onChange={(e) => setBraces(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-[var(--border)] rounded-full peer-checked:bg-[var(--accent)] transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                </label>
            </div>

            <button
                onClick={handleGenerate}
                className="w-full py-2.5 bg-[var(--accent)] text-white rounded-md font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2"
            >
                <RefreshCw size={14} /> Generate
            </button>

            {/* History */}
            <div className="flex-1 min-h-0 flex flex-col border-t border-[var(--border)] pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-1"><History size={12} /> History</span>
                    {history.length > 0 && <button onClick={clearHistory} className="text-[10px] text-[var(--accent)]">Clear</button>}
                </div>
                <div className="flex-1 overflow-auto space-y-1">
                    {history.length === 0 ? (
                        <div className="text-xs text-center text-[var(--fg-secondary)] py-4">No history</div>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className="bg-[var(--bg-secondary)] p-2 rounded text-xs font-mono cursor-pointer hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)]">
                                <div className="text-[var(--fg)] truncate">{item.preview}</div>
                                <div className="text-[var(--fg-secondary)] opacity-70 mt-1">{item.config}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Settings & History</span>
                <Fingerprint size={12} />
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
                {Controls}
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between sticky top-0 z-10">
                <span>Output</span>
                <span>{quantity} UUID{quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                    language="plaintext"
                    value={result}
                    onChange={() => { }} // Read-only
                />
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">UUID / GUID Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Cryptographically Secure</h3>
                    <p className="text-[var(--fg-secondary)]">Uses the native Web Crypto API to ensure generated IDs are random and unpredictable. Suitable for session tokens and secure identifiers.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Flexible Formatting</h3>
                    <p className="text-[var(--fg-secondary)]">Generate up to 500 UUIDs at once. Customize output with uppercase, braces, or remove hyphens for your specific formatting needs.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="UUID Generator"
            filename="uuid.txt"
            defaultFilename="uuid.txt"
            extension="txt"
            toolId="uuid"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}
            onDownload={() => {
                const blob = new Blob([result], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "uuid.txt";
                a.click();
            }}
        />
    );
}