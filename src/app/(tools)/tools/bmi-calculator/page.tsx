"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    Scale,
    Ruler,
    Activity,
    Heart,
    ArrowRightLeft,
    Copy,
    Download
} from "lucide-react";

type UnitSystem = "metric" | "imperial";

interface BMIResult {
    bmi: number;
    category: string;
    color: string;
    pointerPos: number;
    idealWeight: { min: number; max: number };
}

export default function BMICalculatorPage() {
    const [system, setSystem] = useState<UnitSystem>("metric");

    // Metric State
    const [cm, setCm] = useState("");
    const [kg, setKg] = useState("");

    // Imperial State
    const [ft, setFt] = useState("");
    const [inch, setInch] = useState("");
    const [lbs, setLbs] = useState("");

    // --- Calculation Logic ---

    const result = useMemo((): BMIResult | null => {
        let weightKg = 0;
        let heightM = 0;

        if (system === "metric") {
            weightKg = parseFloat(kg);
            heightM = parseFloat(cm) / 100;
        } else {
            weightKg = parseFloat(lbs) * 0.453592;
            const totalInches = (parseFloat(ft) * 12) + parseFloat(inch);
            heightM = totalInches * 0.0254;
        }

        if (!weightKg || !heightM || weightKg <= 0 || heightM <= 0) return null;

        // Calculate BMI
        const bmi = weightKg / (heightM * heightM);

        // Determine Category and Color
        let category = "";
        let color = "";

        // Spectrum logic: Map BMI 15 to 0% and BMI 40 to 100% for the visual pointer
        // Formula: (bmi - 15) / 25 * 100
        let pointerPos = ((bmi - 15) / 25) * 100;
        pointerPos = Math.max(0, Math.min(100, pointerPos)); // Clamp between 0 and 100

        if (bmi < 18.5) {
            category = "Underweight";
            color = "#3b82f6"; // Blue
        } else if (bmi < 25) {
            category = "Normal Weight";
            color = "#10b981"; // Green
        } else if (bmi < 30) {
            category = "Overweight";
            color = "#f59e0b"; // Amber
        } else {
            category = "Obese";
            color = "#ef4444"; // Red
        }

        // Ideal Weight Range (BMI 18.5 - 24.9)
        const minWeight = 18.5 * (heightM * heightM);
        const maxWeight = 24.9 * (heightM * heightM);

        return {
            bmi,
            category,
            color,
            pointerPos,
            idealWeight: {
                min: system === "metric" ? minWeight : minWeight * 2.20462,
                max: system === "metric" ? maxWeight : maxWeight * 2.20462
            }
        };
    }, [system, cm, kg, ft, inch, lbs]);

    // --- Handlers ---

    const swapSystem = () => {
        setSystem(p => p === "metric" ? "imperial" : "metric");
    };

    const copyResults = () => {
        if (!result) return;
        const unitLabel = system === "metric" ? "kg/cm" : "lbs/ft/in";
        const text = `BMI: ${result.bmi.toFixed(1)} (${result.category})\nSystem: ${unitLabel}\nIdeal Weight: ${result.idealWeight.min.toFixed(1)} - ${result.idealWeight.max.toFixed(1)}`;
        navigator.clipboard.writeText(text);
        toast.success("Results copied!");
    };

    const downloadResults = () => {
        if (!result) return;
        // Similar to copy, generate text file
        const unitLabel = system === "metric" ? "kg/cm" : "lbs/ft/in";
        const text = `BMI Calculation Result\n\nBMI: ${result.bmi.toFixed(1)}\nCategory: ${result.category}\nSystem: ${unitLabel}\nIdeal Weight Range: ${result.idealWeight.min.toFixed(1)} - ${result.idealWeight.max.toFixed(1)}`;

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bmi-result.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex items-center justify-center gap-2 h-full w-full">
            <button
                onClick={() => setSystem("metric")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${system === "metric" ? "bg-emerald-600 text-white" : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] hover:bg-[var(--border)]"}`}
            >
                Metric
            </button>
            <button
                onClick={() => setSystem("imperial")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${system === "imperial" ? "bg-emerald-600 text-white" : "bg-[var(--bg-secondary)] text-[var(--fg-secondary)] hover:bg-[var(--border)]"}`}
            >
                Imperial
            </button>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] p-6 gap-6">

            {/* Height Input */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2">
                    <Ruler size={12} /> Height
                </label>

                {system === "metric" ? (
                    <div className="relative">
                        <input
                            type="number"
                            value={cm}
                            onChange={(e) => setCm(e.target.value)}
                            placeholder="175"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] text-xs font-bold">cm</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input
                                type="number"
                                value={ft}
                                onChange={(e) => setFt(e.target.value)}
                                placeholder="5"
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] text-xs font-bold">ft</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={inch}
                                onChange={(e) => setInch(e.target.value)}
                                placeholder="9"
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] text-xs font-bold">in</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase flex items-center gap-2">
                    <Scale size={12} /> Weight
                </label>

                {system === "metric" ? (
                    <div className="relative">
                        <input
                            type="number"
                            value={kg}
                            onChange={(e) => setKg(e.target.value)}
                            placeholder="70"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] text-xs font-bold">kg</span>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="number"
                            value={lbs}
                            onChange={(e) => setLbs(e.target.value)}
                            placeholder="154"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-secondary)] text-xs font-bold">lbs</span>
                    </div>
                )}
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] p-6">

            {/* Result Display */}
            <div className="flex flex-col items-center justify-center py-4">
                <div className="text-7xl font-bold text-emerald-600" style={{ color: result?.color || 'var(--accent)' }}>
                    {result ? result.bmi.toFixed(1) : "0.0"}
                </div>
                <div className="mt-2 text-lg font-semibold" style={{ color: result?.color || 'var(--fg-secondary)' }}>
                    {result ? result.category : "Enter Data"}
                </div>
            </div>

            {/* Visual Spectrum */}
            <div className="mt-4 mb-6">
                <div className="flex justify-between text-[10px] text-[var(--fg-secondary)] mb-1 px-1">
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                </div>

                {/* Gradient Bar */}
                <div className="relative h-3 rounded-full overflow-hidden bg-gray-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-400 via-45% via-amber-400 via-70% to-red-500"></div>

                    {/* Pointer */}
                    {result && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--bg)] border-2 rounded-sm transition-all duration-300"
                            style={{ left: `${result.pointerPos}%`, borderColor: result.color, transform: `translateX(-50%) translateY(-50%)` }}
                        />
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            {result && (
                <div className="grid grid-cols-2 gap-4 mt-auto border-t border-[var(--border)] pt-4">
                    <div className="bg-[var(--bg)] p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-emerald-600">{result.idealWeight.min.toFixed(1)}</div>
                        <div className="text-[10px] text-[var(--fg-secondary)]">Min Healthy Weight</div>
                    </div>
                    <div className="bg-[var(--bg)] p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-emerald-600">{result.idealWeight.max.toFixed(1)}</div>
                        <div className="text-[10px] text-[var(--fg-secondary)]">Max Healthy Weight</div>
                    </div>
                </div>
            )}

            {!result && (
                <div className="mt-auto text-center text-xs text-[var(--fg-secondary)] border-t border-[var(--border)] pt-4">
                    <Heart size={16} className="inline mb-1 text-red-400" />
                    BMI is a general indicator. Consult a doctor for health advice.
                </div>
            )}
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">BMI Calculator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Metric & Imperial</h3>
                    <p className="text-[var(--fg-secondary)]">Supports both Metric (kg/cm) and Imperial (lbs/ft/in) units for global usability.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Health Ranges</h3>
                    <p className="text-[var(--fg-secondary)]">Instantly see your healthy weight range based on the WHO BMI classification.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="BMI Calculator"
            filename="bmi-result.txt"
            defaultFilename="bmi-result.txt"
            extension="txt"
            toolId="bmi-calculator"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyResults}
            onDownload={downloadResults}
        />
    );
}