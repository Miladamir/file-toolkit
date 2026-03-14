"use client";

import { useState } from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    flags: { [key: string]: boolean };
    onFlagChange: (flag: string) => void;
    error?: string;
}

export default function RegexInput({ value, onChange, flags, onFlagChange, error }: Props) {
    return (
        <div className="w-full">
            <div className={`flex items-center bg-[var(--bg-secondary)] border ${error ? 'border-red-500' : 'border-[var(--border)]'} rounded-lg p-1 transition-colors`}>
                <span className="text-[var(--accent)] font-bold text-lg px-2 select-none">/</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent outline-none font-mono text-[var(--fg)] text-sm py-1"
                    placeholder="Enter regex pattern"
                    spellCheck="false"
                    autoComplete="off"
                />
                <span className="text-[var(--accent)] font-bold text-lg px-2 select-none">/</span>

                <div className="flex items-center gap-1 pr-1 border-l border-[var(--border)] pl-2 ml-2">
                    {Object.keys(flags).map((flag) => (
                        <button
                            key={flag}
                            onClick={() => onFlagChange(flag)}
                            className={`w-7 h-7 rounded text-xs font-mono font-bold transition-colors ${flags[flag]
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--bg)] text-[var(--fg-secondary)] hover:bg-[var(--border)]'
                                }`}
                            title={`Flag: ${flag}`}
                        >
                            {flag}
                        </button>
                    ))}
                </div>
            </div>
            {error && (
                <div className="text-red-500 text-xs mt-1 pl-2">{error}</div>
            )}
        </div>
    );
}