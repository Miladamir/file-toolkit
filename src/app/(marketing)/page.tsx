import Link from "next/link";
import { tools } from "@/config/tools";
import ToolCard from "@/components/ui/ToolCard";

export default function Home() {
  // Select top 6 tools for the home page featured section, or show all if you prefer
  const featuredTools = tools.slice(0, 6);

  return (
    <div className="relative pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6 reveal visible">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            100% Client-Side Processing
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-[var(--fg)] leading-tight mb-6 reveal visible delay-1">
            All your file tools.<br />
            One place.
          </h1>

          <p className="text-lg md:text-xl text-[var(--fg-secondary)] max-w-2xl mx-auto mb-10 reveal visible delay-2">
            A curated collection of high-quality tools for developers and designers. Edit, convert, and format files directly in your browser.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 reveal visible delay-3">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--fg)] text-[var(--bg)] font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Browse Tools
              <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
            <Link
              href="/tools/json" // Example deep link
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-[var(--fg)] font-medium rounded-lg border border-[var(--card-border)] hover:bg-[var(--bg-secondary)] hover:border-[var(--fg-secondary)] transition-all"
            >
              Try JSON Editor
            </Link>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="mb-24">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--fg)]">Featured Tools</h2>
            <Link href="/tools" className="text-sm text-[var(--accent)] font-medium hover:underline">
              View all tools ({tools.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Minimal Features */}
        <section className="grid md:grid-cols-3 gap-8 text-center pt-12 border-t border-[var(--card-border)]">
          <div className="p-6 reveal">
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--card-border)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <h3 className="font-semibold mb-2 text-lg text-[var(--fg)]">100% Private</h3>
            <p className="text-[var(--fg-secondary)] text-sm">All processing happens in your browser. Your data never leaves your device.</p>
          </div>
          <div className="p-6 reveal delay-1">
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--card-border)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <h3 className="font-semibold mb-2 text-lg text-[var(--fg)]">Blazing Fast</h3>
            <p className="text-[var(--fg-secondary)] text-sm">No server uploads means instant results. Works offline for most tools.</p>
          </div>
          <div className="p-6 reveal delay-2">
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--card-border)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            </div>
            <h3 className="font-semibold mb-2 text-lg text-[var(--fg)]">Modern Design</h3>
            <p className="text-[var(--fg-secondary)] text-sm">Clean interface with dark mode support. Built for focus and productivity.</p>
          </div>
        </section>

      </div>
    </div>
  );
}