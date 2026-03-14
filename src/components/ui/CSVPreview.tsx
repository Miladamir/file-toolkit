"use client";

import { useFileStore } from "@/store/editorStore";
import Papa from "papaparse";
import { useMemo, useState } from "react";

export default function CSVPreview() {
    const { content, setContent } = useFileStore();

    // Parse data for rendering
    const data = useMemo(() => {
        if (!content) return [];
        const result = Papa.parse<string[]>(content, { skipEmptyLines: true });
        return result.data as string[][];
    }, [content]);

    // Handle Cell Edit
    const handleCellEdit = (rowIndex: number, colIndex: number, newValue: string) => {
        const newData = [...data];
        // Ensure row exists
        if (!newData[rowIndex]) return;
        // Ensure column exists
        if (newData[rowIndex].length <= colIndex) {
            // Extend columns if necessary (though table structure should match)
            newData[rowIndex] = [...newData[rowIndex], ...Array(colIndex - newData[rowIndex].length + 1).fill("")];
        }

        newData[rowIndex][colIndex] = newValue;
        setContent(Papa.unparse(newData));
    };

    if (!content || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)]">
                Paste CSV to see grid view
            </div>
        );
    }

    const maxCols = Math.max(...data.map(row => row.length), 1);

    return (
        <div className="h-full w-full overflow-auto bg-[var(--bg-secondary)]">
            <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-10">
                    <tr>
                        {Array.from({ length: maxCols }).map((_, colIdx) => (
                            <th
                                key={colIdx}
                                className="bg-[var(--bg)] border-b border-r border-[var(--border)] px-4 py-2 text-left font-semibold text-[var(--fg)] min-w-[120px]"
                            >
                                {colIdx + 1}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-[var(--accent-light)]">
                            {Array.from({ length: maxCols }).map((_, colIdx) => (
                                <td
                                    key={colIdx}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleCellEdit(rowIdx, colIdx, e.currentTarget.textContent || "")}
                                    className={`border-b border-r border-[var(--border)] px-4 py-2 min-w-[120px] text-[var(--fg)] ${rowIdx === 0 ? 'font-medium bg-[var(--bg-secondary)]' : 'bg-white dark:bg-transparent'
                                        }`}
                                >
                                    {row[colIdx] || ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}