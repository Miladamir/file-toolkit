"use client";

interface Props {
    data: any[];
    error: string | null;
}

export default function SQLResults({ data, error }: Props) {
    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-8 text-red-500 dark:text-red-400 text-center">
                <div>
                    <div className="font-bold mb-2">Error</div>
                    <div className="text-xs font-mono bg-red-50 dark:bg-red-900/20 p-4 rounded">{error}</div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[var(--fg-secondary)]">
                No results to display
            </div>
        );
    }

    const keys = Object.keys(data[0]);

    return (
        <div className="h-full w-full overflow-auto">
            <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-[var(--bg)]">
                    <tr>
                        {keys.map(k => (
                            <th key={k} className="p-3 text-left border-b border-r border-[var(--border)] font-semibold">
                                {k}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-[var(--accent-light)]">
                            {keys.map(k => (
                                <td key={k} className="p-3 border-b border-r border-[var(--border)]">
                                    {String(row[k])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}