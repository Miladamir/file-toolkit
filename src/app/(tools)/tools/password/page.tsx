"use client";

import { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import { RefreshCw, Copy, ShieldCheck, AlertTriangle, Shield, ShieldAlert } from "lucide-react";

// --- Types & Constants ---
interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeAmbiguous: boolean;
}

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

const AMBIGUOUS_CHARS = /[l1IO0]/g;

// --- Logic: Cryptographically Secure Generator ---

function generateSecurePassword(options: PasswordOptions): string {
    const { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous } = options;

    let chars = "";
    if (uppercase) chars += CHAR_SETS.uppercase;
    if (lowercase) chars += CHAR_SETS.lowercase;
    if (numbers) chars += CHAR_SETS.numbers;
    if (symbols) chars += CHAR_SETS.symbols;

    if (chars.length === 0) return "";

    if (excludeAmbiguous) {
        chars = chars.replace(AMBIGUOUS_CHARS, '');
    }

    // Use Web Crypto API for secure random values
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[randomValues[i] % chars.length];
    }

    return password;
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (password.length >= 24) score++;

    // Composition
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Fair", color: "bg-orange-500" };
    if (score <= 6) return { score, label: "Strong", color: "bg-green-500" };
    return { score, label: "Very Strong", color: "bg-emerald-600" };
}

// --- Components ---

export default function PasswordGeneratorPage() {
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
    });
    const [password, setPassword] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [strength, setStrength] = useState({ label: "", color: "", score: 0 });

    const generate = useCallback(() => {
        const newPassword = generateSecurePassword(options);
        setPassword(newPassword);
        setStrength(calculateStrength(newPassword));
    }, [options]);

    useEffect(() => {
        generate();
    }, [generate]);

    const updateOption = (key: keyof PasswordOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Password copied!");
    };

    const saveToHistory = (pass: string) => {
        setHistory(prev => {
            const newHistory = [pass, ...prev.filter(p => p !== pass)];
            return newHistory.slice(0, 5); // Keep last 5
        });
    };

    const handleGenerateClick = () => {
        generate();
        saveToHistory(password);
    };

    const Controls = (
        <div className="p-6 space-y-6 h-full overflow-auto">
            {/* Length Slider */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-[var(--fg)]">Length</span>
                    <span className="font-mono text-[var(--accent)] font-bold">{options.length}</span>
                </div>
                <input
                    type="range"
                    min="4" max="64"
                    value={options.length}
                    onChange={(e) => updateOption("length", +e.target.value)}
                    className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
            </div>

            {/* Options */}
            <div className="space-y-3">
                <ToggleOption label="Uppercase (A-Z)" checked={options.uppercase} onChange={(v) => updateOption("uppercase", v)} />
                <ToggleOption label="Lowercase (a-z)" checked={options.lowercase} onChange={(v) => updateOption("lowercase", v)} />
                <ToggleOption label="Numbers (0-9)" checked={options.numbers} onChange={(v) => updateOption("numbers", v)} />
                <ToggleOption label="Symbols (!@#$)" checked={options.symbols} onChange={(v) => updateOption("symbols", v)} />
            </div>

            <div className="pt-4 border-t border-[var(--border)] space-y-3">
                <ToggleOption
                    label="Exclude Ambiguous (l, 1, I, O, 0)"
                    checked={options.excludeAmbiguous}
                    onChange={(v) => updateOption("excludeAmbiguous", v)}
                />
            </div>
        </div>
    );

    const Preview = (
        <div className="h-full flex flex-col bg-[var(--bg)]">
            {/* Password Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 relative group">
                    <p className="font-mono text-2xl md:text-3xl text-center break-all tracking-wider font-semibold text-[var(--fg)]">
                        {password || "..."}
                    </p>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyToClipboard(password)} className="p-2 bg-[var(--bg)] rounded shadow hover:bg-[var(--bg-secondary)]" title="Copy">
                            <Copy size={14} />
                        </button>
                        <button onClick={handleGenerateClick} className="p-2 bg-[var(--bg)] rounded shadow hover:bg-[var(--bg-secondary)]" title="Refresh">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* Strength Meter */}
                <div className="w-full max-w-md space-y-2">
                    <div className="h-2 w-full bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${(strength.score / 8) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-[var(--fg-secondary)]">Strength</span>
                        <span className={`font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                </div>
            </div>

            {/* History */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex-shrink-0">
                <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider mb-2">Recent History</h3>
                {history.length === 0 ? (
                    <div className="text-xs text-center text-[var(--fg-secondary)] py-2">Click refresh to save to history</div>
                ) : (
                    <div className="space-y-1">
                        {history.map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-[var(--bg)] p-2 rounded text-xs font-mono group">
                                <span className="truncate pr-2">{p}</span>
                                <button onClick={() => copyToClipboard(p)} className="opacity-0 group-hover:opacity-100 text-[var(--accent)]">Copy</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Secure Password Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Cryptographically Secure</h3>
                    <p className="text-[var(--fg-secondary)]">Uses the Web Crypto API to ensure high entropy and unpredictability. No predictable `Math.random()` calls.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Fully Customizable</h3>
                    <p className="text-[var(--fg-secondary)]">Adjust length and character sets to meet specific security requirements.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Password Generator"
            filename="password.txt"
            defaultFilename="password.txt"
            extension="txt"
            toolId="password"
            editorSlot={Controls}
            previewSlot={Preview}
            seoContent={SeoContent}
            onCopy={() => copyToClipboard(password)}
            onDownload={() => {
                const blob = new Blob([password], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "password.txt";
                a.click();
            }}
        />
    );
}

// --- Helper Component for Toggles ---
function ToggleOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-[var(--fg-secondary)] group-hover:text-[var(--fg)] transition-colors">{label}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}