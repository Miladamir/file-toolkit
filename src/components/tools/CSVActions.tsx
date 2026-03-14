"use client";

import { useFileStore } from "@/store/editorStore";
import Papa from "papaparse";
import { toast } from "sonner";
import { Plus, ArrowUpAz, ArrowDownZa, Braces, Table } from "lucide-react";

export default function CSVActions() {
    const { content, setContent } = useFileStore();

    // Helper to parse content
    const parse = () => {
        if (!content) return [];
        return Papa.parse<string[]>(content, { skipEmptyLines: true }).data as string[][];
    };

    // Helper to stringify data back to CSV
    const updateContent = (data: string[][]) => {
        setContent(Papa.unparse(data));
    };

    const handleAddRow = () => {
        const data = parse();
        if (data.length === 0) {
            toast.error("Add headers first");
            return;
        }
        const newRow = new Array(data[0].length).fill("");
        updateContent([...data, newRow]);
        toast.success("Row added");
    };

    const handleAddCol = () => {
        const data = parse();
        if (data.length === 0) {
            updateContent([[""]]); // Start new table
            return;
        }
        const newData = data.map(row => [...row, ""]);
        updateContent(newData);
        toast.success("Column added");
    };

    const handleSort = (direction: 'asc' | 'desc') => {
        const data = parse();
        if (data.length < 2) return toast.error("Not enough data to sort");

        const headers = data[0];
        const rows = data.slice(1);

        rows.sort((a, b) => {
            const valA = a[0] || "";
            const valB = b[0] || "";

            // Numeric check
            const numA = parseFloat(valA);
            const numB = parseFloat(valB);
            if (!isNaN(numA) && !isNaN(numB)) {
                return direction === 'asc' ? numA - numB : numB - numA;
            }
            return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });

        updateContent([headers, ...rows]);
        toast.success(`Sorted ${direction === 'asc' ? 'A-Z' : 'Z-A'}`);
    };

    const handleConvertToJSON = () => {
        const result = Papa.parse(content, { header: true, skipEmptyLines: true });
        if (result.errors.length > 0) {
            toast.error("CSV is invalid");
            return;
        }
        const json = JSON.stringify(result.data, null, 2);
        navigator.clipboard.writeText(json);
        toast.success("JSON copied to clipboard!");
    };

    const btnClass = "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] rounded-md transition-all";

    return (
        <div className="flex items-center gap-3 h-full">
            {/* Edit */}
            <div className="flex items-center gap-2">
                <button onClick={handleAddRow} className={btnClass}>
                    <Plus size={14} /> Row
                </button>
                <button onClick={handleAddCol} className={btnClass}>
                    <Table size={14} /> Col
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Sort */}
            <div className="flex items-center gap-2">
                <button onClick={() => handleSort('asc')} className={btnClass}>
                    <ArrowUpAz size={14} /> A-Z
                </button>
                <button onClick={() => handleSort('desc')} className={btnClass}>
                    <ArrowDownZa size={14} /> Z-A
                </button>
            </div>

            <div className="h-6 w-px bg-[var(--border)]"></div>

            {/* Convert */}
            <div className="flex items-center gap-2">
                <button onClick={handleConvertToJSON} className={btnClass}>
                    <Braces size={14} /> To JSON
                </button>
            </div>
        </div>
    );
}