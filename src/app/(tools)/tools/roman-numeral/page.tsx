"use client";

import { useState } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    ArrowRight,
    ArrowLeft,
    Hash,
    CaseSensitive,
    AlertCircle,
    Grid3X3,
    Copy,
    Download,
    RefreshCcw // Added missing import
} from "lucide-react";

// --- Constants & Logic ---

const ROMAN_LOOKUP = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" }
];

const REFERENCE_LIST = [
    { symbol: "I", value: 1 }, { symbol: "V", value: 5 }, { symbol: "X", value: 10 },
    { symbol: "L", value: 50 }, { symbol: "C", value: 100 }, { symbol: "D", value: 500 },
    { symbol: "M", value: 1000 }
];

// Regex for valid Roman Numerals (Standard Subtractive Notation)
const ROMAN_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

// Decimal to Roman
const toRoman = (num: number): string => {
    if (num < 1 || num > 3999) return "";
    let result = "";
    for (const { value, symbol } of ROMAN_LOOKUP) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
};

// Roman to Decimal
const fromRoman = (str: string): number | null => {
    if (!ROMAN_REGEX.test(str)) return null;

    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    let i = 0;

    while (i < str.length) {
        const current = map[str[i]];
        const next = map[str[i + 1]];

        if (next && current < next) {
            total += next - current;
            i += 2;
        } else {
            total += current;
            i += 1;
        }
    }
    return total;
};

export default function RomanNumeralPage() {
    const [decimalInput, setDecimalInput] = useState("");
    const [romanInput, setRomanInput] = useState("");

    const [romanResult, setRomanResult] = useState("");
    const [decimalResult, setDecimalResult] = useState("");

    const [errorDecimal, setErrorDecimal] = useState("");
    const [errorRoman, setErrorRoman] = useState("");

    // Handlers
    const handleDecimalChange = (val: string) => {
        setDecimalInput(val);
        setErrorDecimal("");
        setRomanResult("");

        if (!val) return;

        const num = parseInt(val);
        if (isNaN(num)) return;

        if (num < 1 || num > 3999) {
            setErrorDecimal("Range: 1 - 3999");
        } else {
            setRomanResult(toRoman(num));
        }
    };

    const handleRomanChange = (val: string) => {
        const upperVal = val.toUpperCase();
        setRomanInput(upperVal);
        setErrorRoman("");
        setDecimalResult("");

        if (!upperVal) return;

        const result = fromRoman(upperVal);
        if (result === null) {
            setErrorRoman("Invalid Roman Numeral");
        } else {
            setDecimalResult(String(result));
        }
    };

    const insertSymbol = (symbol: string) => {
        setRomanInput(prev => prev + symbol);
        // Trigger calculation manually since we are setting state
        const newVal = romanInput + symbol;
        const res = fromRoman(newVal);
        if (res !== null) setDecimalResult(String(res));
        else setErrorRoman("Invalid Roman Numeral");
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    const downloadResults = () => {
        const content = `Roman Numeral Conversion\n\nDecimal: ${decimalInput}\nRoman: ${romanResult}\n\nRoman: ${romanInput}\nDecimal: ${decimalResult}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "conversion.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center gap-2 h-full">
            <button
                onClick={() => { setDecimalInput(""); setRomanResult(""); setRomanInput(""); setDecimalResult(""); }}
                className="text-xs text-[var(--fg-secondary)] hover:text-[var(--fg)] flex items-center gap-1"
            >
                <RefreshCcw size={12} /> Clear
            </button>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] p-6 gap-6">
            {/* Decimal to Roman */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2">
                    <Hash size={12} /> Decimal to Roman
                </label>
                <input
                    type="number"
                    value={decimalInput}
                    onChange={(e) => handleDecimalChange(e.target.value)}
                    placeholder="e.g. 2023"
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-xl font-mono outline-none focus:ring-1 focus:ring-red-500 transition-all"
                />

                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 text-center min-h-[60px] flex flex-col justify-center">
                    {errorDecimal && <span className="text-red-500 text-xs">{errorDecimal}</span>}
                    {romanResult && (
                        <div className="text-3xl font-bold text-red-600 font-mono tracking-wide">
                            {romanResult}
                        </div>
                    )}
                    {!romanResult && !errorDecimal && <span className="text-[var(--fg-secondary)] text-xs">Enter a number</span>}
                </div>
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] overflow-auto">
            <div className="p-6 flex flex-col gap-6">

                {/* Roman to Decimal */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2">
                        <CaseSensitive size={12} /> Roman to Decimal
                    </label>
                    <input
                        type="text"
                        value={romanInput}
                        onChange={(e) => handleRomanChange(e.target.value)}
                        placeholder="e.g. MMXXIII"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-4 py-3 text-xl font-mono uppercase outline-none focus:ring-1 focus:ring-red-500 transition-all"
                    />

                    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 text-center min-h-[60px] flex flex-col justify-center">
                        {errorRoman && <span className="text-red-500 text-xs flex items-center justify-center gap-1"><AlertCircle size={12} /> {errorRoman}</span>}
                        {decimalResult && (
                            <div className="text-3xl font-bold text-[var(--fg)] font-mono">
                                {decimalResult}
                            </div>
                        )}
                        {!decimalResult && !errorRoman && <span className="text-[var(--fg-secondary)] text-xs">Enter a Roman numeral</span>}
                    </div>
                </div>
            </div>

            {/* Reference Chart */}
            <div className="mt-auto border-t border-[var(--border)] bg-[var(--bg)] p-6">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2 mb-3">
                    <Grid3X3 size={12} /> Reference Chart (Click to Insert)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {REFERENCE_LIST.map(item => (
                        <button
                            key={item.symbol}
                            onClick={() => insertSymbol(item.symbol)}
                            className="flex flex-col items-center justify-center p-2 rounded border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-red-400 hover:text-red-600 transition-colors"
                        >
                            <span className="text-lg font-bold font-mono">{item.symbol}</span>
                            <span className="text-[10px] text-[var(--fg-secondary)]">{item.value}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Roman Numeral Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Standard Notation</h3>
                    <p className="text-[var(--fg-secondary)]">Converts numbers using standard subtractive notation (e.g., IV for 4, IX for 9). Valid range is 1-3999.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Interactive Reference</h3>
                    <p className="text-[var(--fg-secondary)]">Use the reference chart to learn or quickly build Roman numerals by clicking symbols.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Roman Numeral"
            filename="conversion.txt"
            defaultFilename="conversion.txt"
            extension="txt"
            toolId="roman-numeral"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => copyText(romanResult || decimalResult || "", "Result")}
            onDownload={downloadResults}
        />
    );
}