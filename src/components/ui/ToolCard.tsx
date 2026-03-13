import Link from "next/link";
import { ToolConfig } from "@/config/tools";
import { ArrowRight } from "lucide-react";

interface Props {
    tool: ToolConfig;
}

export default function ToolCard({ tool }: Props) {
    const Icon = tool.icon;

    return (
        <Link
            href={`/tools/${tool.id}`}
            className="group relative block p-6 bg-[var(--card)] border border-[var(--card-border)] rounded-2xl transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[var(--shadow-lg)] hover:shadow-[var(--glow)] hover:-translate-y-1"
        >
            {/* Header: Icon + Meta */}
            <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] transition-colors group-hover:bg-[var(--accent-light)] group-hover:border-[var(--accent)] flex-shrink-0">
                    <Icon className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-1 truncate">
                        {tool.name}
                    </h3>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-secondary)] text-[var(--fg-secondary)] border border-[var(--card-border)]">
                        {tool.extension}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed line-clamp-2">
                {tool.description}
            </p>

            {/* Hover Arrow */}
            <div className="absolute top-6 right-6 opacity-0 transform -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--accent)]">
                <ArrowRight className="w-5 h-5" />
            </div>
        </Link>
    );
}