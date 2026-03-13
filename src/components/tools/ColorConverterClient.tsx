"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ColorConverterClient() {
    const [hex, setHex] = useState("#3b82f6");
    const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
    const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

    // Helper: Convert HEX to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    };

    // Helper: RGB to HEX
    const rgbToHex = (r: number, g: number, b: number) => {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
    };

    // Helper: RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    // Helper: HSL to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100; l /= 100;
        const k = (n: number) => (a: number) => (a + n / 30) % 12;
        const f = (n: number) => l - (s * Math.min(l, 1 - l)) * Math.max(-1, Math.min(k(n)(h) - 3, Math.min(9 - k(n)(h), 1)));
        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4))
        };
    };

    // Effect to sync changes
    const handleHexChange = (value: string) => {
        setHex(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            const rgbVal = hexToRgb(value);
            if (rgbVal) {
                setRgb(rgbVal);
                setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
            }
        }
    };

    const handleRgbChange = (key: "r" | "g" | "b", value: number) => {
        const newRgb = { ...rgb, [key]: value };
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleHslChange = (key: "h" | "s" | "l", value: number) => {
        const newHsl = { ...hsl, [key]: value };
        setHsl(newHsl);
        const rgbVal = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        setRgb(rgbVal);
        setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b));
    };

    return (
        <div className="flex flex-col h-full overflow-auto bg-white dark:bg-zinc-950 p-6 space-y-8">

            {/* Visual Preview */}
            <div className="flex flex-col items-center gap-4">
                <div
                    className="w-40 h-40 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 transition-colors duration-200"
                    style={{ backgroundColor: hex }}
                />
                <input
                    type="color"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full h-12 rounded cursor-pointer border-none"
                />
            </div>

            {/* Input Groups */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">

                {/* HEX */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500">Hex</label>
                    <input
                        type="text"
                        value={hex}
                        onChange={(e) => handleHexChange(e.target.value)}
                        className="w-full p-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>

                {/* RGB */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500">RGB</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(["r", "g", "b"] as const).map((key) => (
                            <input
                                key={key}
                                type="number"
                                min="0"
                                max="255"
                                value={rgb[key]}
                                onChange={(e) => handleRgbChange(key, parseInt(e.target.value) || 0)}
                                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md font-mono text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        ))}
                    </div>
                </div>

                {/* HSL */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500">HSL</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(["h", "s", "l"] as const).map((key) => (
                            <input
                                key={key}
                                type="number"
                                min="0"
                                max={key === "h" ? "360" : "100"}
                                value={hsl[key]}
                                onChange={(e) => handleHslChange(key, parseInt(e.target.value) || 0)}
                                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md font-mono text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}