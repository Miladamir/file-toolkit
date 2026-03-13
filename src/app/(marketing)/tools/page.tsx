"use client";

import { useState, useMemo } from "react";
import { tools } from "@/config/tools";
import ToolCard from "@/components/ui/ToolCard";
import { Search } from "lucide-react";

export default function AllToolsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTools = useMemo(() => {
        if (!searchQuery) return tools;

        const query = searchQuery.toLowerCase();
        return tools.filter(tool =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.extension.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="text-center px-4 pt-24 pb-12 border-b border-[var(--card-border)] bg-[radial-gradient(circle_at_top,var(--accent-light)_0%,transparent_60%)]">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--fg)] tracking-tight mb-3">
                    All Tools
                </h1>
                <p className="text-lg text-[var(--fg-secondary)] max-w-md mx-auto mb-8">
                    Browse our complete collection of developer utilities. Fast, free, and private.
                </p>

                {/* Search Bar */}
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-secondary)] pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tools (e.g. JSON, Image...)"
                        className="w-full py-3.5 pl-12 pr-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-[var(--fg)] placeholder:text-[var(--fg-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all shadow-sm"
                    />
                </div>
            </section>

            {/* Tools Grid Section */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                {/* Optional: Result Count */}
                {searchQuery && (
                    <p className="text-sm text-[var(--fg-secondary)] mb-6">
                        Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} matching "{searchQuery}"
                    </p>
                )}

                {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-[var(--fg-secondary)]">No tools found. Try a different search term.</p>
                    </div>
                )}
            </section>
        </main>
    );
}