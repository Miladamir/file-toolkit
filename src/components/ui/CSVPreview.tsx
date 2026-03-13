"use client";

import { useFileStore } from "@/store/editorStore";
import Papa from "papaparse";
import { useMemo } from "react";

export default function CSVPreview() {
    const { content } = useFileStore();

    // Memoize parsing to avoid re-parsing on every render
    const data = useMemo(() => {
        if (!content) return [];
        const result = Papa.parse<string[]>(content, {
            skipEmptyLines: true,
        });
        return result.data;
    }, [content]);

    if (!content) {
        return (
            <div className="h-full w-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                No CSV data to display
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-auto p-4 bg-white dark:bg-zinc-950">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800">
                        {/* Render Header Row (assumes first row is header) */}
                        {data[0]?.map((cell, index) => (
                            <th
                                key={index}
                                className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* Render Body Rows (skipping header) */}
                    {data.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-zinc-600 dark:text-zinc-300"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}