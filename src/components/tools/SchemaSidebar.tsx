"use client";
import { DB } from "@/lib/mockDb";

export default function SchemaSidebar() {
    return (
        <div className="p-4 text-xs font-mono">
            <div className="text-[var(--fg-secondary)] uppercase tracking-widest text-[10px] font-bold mb-4">
                Mock Database
            </div>

            {Object.keys(DB).map((tableName) => (
                <div key={tableName} className="mb-4">
                    <div className="text-[var(--accent)] font-bold flex items-center gap-2 mb-1">
                        <span className="text-[8px] opacity-50">◈</span> {tableName}
                    </div>
                    <div className="pl-4 text-[var(--fg-secondary)] opacity-80 text-[10px] flex flex-col gap-0.5">
                        {Object.keys(DB[tableName as keyof typeof DB][0] || {}).map(col => (
                            <div key={col}>{col}</div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}