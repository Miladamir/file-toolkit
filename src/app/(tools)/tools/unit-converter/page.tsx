"use client";

import { useState, useEffect } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    ArrowLeftRight,
    Copy,
    Download,
    Ruler,
    Scale,
    Thermometer,
    Binary
} from "lucide-react";

// --- Unit Definitions & Logic ---

type UnitCategory = "length" | "weight" | "temperature" | "data";

interface UnitConfig {
    name: string;
    units: string[];
    convert: (value: number, from: string, to: string) => number;
}

const unitConfigs: Record<UnitCategory, UnitConfig> = {
    length: {
        name: "Length",
        units: ["Meters", "Kilometers", "Centimeters", "Millimeters", "Miles", "Yards", "Feet", "Inches"],
        convert: (val, from, to) => {
            const toMeters: Record<string, number> = {
                "Meters": 1, "Kilometers": 1000, "Centimeters": 0.01, "Millimeters": 0.001,
                "Miles": 1609.344, "Yards": 0.9144, "Feet": 0.3048, "Inches": 0.0254
            };
            const inMeters = val * (toMeters[from] || 1);
            return inMeters / (toMeters[to] || 1);
        }
    },
    weight: {
        name: "Weight",
        units: ["Kilograms", "Grams", "Milligrams", "Pounds", "Ounces", "Metric Tons"],
        convert: (val, from, to) => {
            const toKg: Record<string, number> = {
                "Kilograms": 1, "Grams": 0.001, "Milligrams": 0.000001,
                "Pounds": 0.453592, "Ounces": 0.0283495, "Metric Tons": 1000
            };
            const inKg = val * (toKg[from] || 1);
            return inKg / (toKg[to] || 1);
        }
    },
    temperature: {
        name: "Temperature",
        units: ["Celsius", "Fahrenheit", "Kelvin"],
        convert: (val, from, to) => {
            // To Celsius
            let celsius = val;
            if (from === "Fahrenheit") celsius = (val - 32) * 5 / 9;
            if (from === "Kelvin") celsius = val - 273.15;

            // From Celsius to Target
            if (to === "Fahrenheit") return (celsius * 9 / 5) + 32;
            if (to === "Kelvin") return celsius + 273.15;
            return celsius;
        }
    },
    data: {
        name: "Data",
        units: ["Bytes", "KB", "MB", "GB", "TB", "Bits"],
        convert: (val, from, to) => {
            const toBytes: Record<string, number> = {
                "Bytes": 1, "KB": 1024, "MB": 1024 ** 2, "GB": 1024 ** 3, "TB": 1024 ** 4, "Bits": 0.125
            };
            const inBytes = val * (toBytes[from] || 1);
            return inBytes / (toBytes[to] || 1);
        }
    }
};

export default function UnitConverterPage() {
    const [category, setCategory] = useState<UnitCategory>("length");
    const [fromUnit, setFromUnit] = useState("Meters");
    const [toUnit, setToUnit] = useState("Kilometers");
    const [fromValue, setFromValue] = useState("1");
    const [toValue, setToValue] = useState("");

    // Sync default units when category changes
    useEffect(() => {
        const units = unitConfigs[category].units;
        setFromUnit(units[0]);
        setToUnit(units[1] || units[0]);
        setFromValue("1");
    }, [category]);

    // Calculation Logic
    useEffect(() => {
        const num = parseFloat(fromValue);
        if (isNaN(num)) {
            setToValue("");
            return;
        }

        try {
            const result = unitConfigs[category].convert(num, fromUnit, toUnit);
            // Format to reasonable precision
            setToValue(result.toPrecision(8).replace(/\.?0+$/, ""));
        } catch {
            setToValue("Error");
        }
    }, [fromValue, fromUnit, toUnit, category]);

    const swapUnits = () => {
        const tempUnit = fromUnit;
        setFromUnit(toUnit);
        setToUnit(tempUnit);
        setFromValue(toValue);
    };

    const copyResult = () => {
        if (!toValue) return;
        navigator.clipboard.writeText(`${fromValue} ${fromUnit} = ${toValue} ${toUnit}`);
        toast.success("Copied to clipboard!");
    };

    const downloadResult = () => {
        const text = `Unit Conversion\n\n${fromValue} ${fromUnit} = ${toValue} ${toUnit}`;
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "conversion.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFromChange = (val: string) => {
        // Allow empty string or valid numbers
        if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
            setFromValue(val);
        }
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center justify-center gap-2 h-full w-full">
            {Object.entries(unitConfigs).map(([key, config]) => (
                <button
                    key={key}
                    onClick={() => setCategory(key as UnitCategory)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${category === key ? "bg-teal-600 text-white" : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] hover:bg-[var(--border)]"}`}
                >
                    {config.name}
                </button>
            ))}
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] p-6">
            <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">From</span>
                <span className="text-[10px] text-[var(--fg-secondary)]">
                    {unitConfigs[category].name}
                </span>
            </div>

            {/* Input Value */}
            <div className="mb-4">
                <input
                    type="text"
                    value={fromValue}
                    onChange={(e) => handleFromChange(e.target.value)}
                    className="w-full bg-transparent text-4xl font-bold text-[var(--fg)] outline-none border-b-2 border-[var(--border)] focus:border-teal-500 pb-2 transition-colors"
                    placeholder="0"
                />
            </div>

            {/* Unit Select */}
            <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-medium text-teal-600 outline-none focus:ring-1 focus:ring-teal-500"
            >
                {unitConfigs[category].units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            <div className="flex-1" />

            {/* Swap Button for Mobile */}
            <button
                onClick={swapUnits}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-lg font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors md:hidden"
            >
                <ArrowLeftRight size={16} /> Swap Units
            </button>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] p-6 relative">

            {/* Swap Button - Absolute positioned for desktop overlay effect */}
            <button
                onClick={swapUnits}
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center z-10 hover:bg-teal-700 transition-colors hidden md:flex"
                title="Swap Units"
            >
                <ArrowLeftRight size={16} />
            </button>

            <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider">To</span>
            </div>

            {/* Output Value */}
            <div className="mb-4">
                <div className="w-full text-4xl font-bold text-teal-600 border-b-2 border-[var(--border)] pb-2 overflow-x-auto">
                    {toValue || "0"}
                </div>
            </div>

            {/* Unit Select */}
            <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-medium text-[var(--fg)] outline-none focus:ring-1 focus:ring-teal-500"
            >
                {unitConfigs[category].units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>

            <div className="flex-1" />

            {/* Formula Visualization */}
            <div className="mt-4 p-3 bg-[var(--bg)] rounded-lg text-xs text-[var(--fg-secondary)] border border-[var(--border)]">
                <strong>Formula:</strong> 1 {fromUnit} = {unitConfigs[category].convert(1, fromUnit, toUnit).toPrecision(4)} {toUnit}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Unit Converter</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Bi-Directional Calculation</h3>
                    <p className="text-[var(--fg-secondary)]">Change either the "From" or "To" value to instantly calculate the conversion in the opposite direction.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Comprehensive Units</h3>
                    <p className="text-[var(--fg-secondary)]">Supports Length, Weight, Temperature, and Digital Storage units with precise conversion factors.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Unit Converter"
            filename="conversion.txt"
            defaultFilename="conversion.txt"
            extension="txt"
            toolId="unit-converter"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyResult}
            onDownload={downloadResult}
        />
    );
}