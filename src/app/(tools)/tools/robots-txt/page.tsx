"use client";

import { useState, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    Bot,
    Plus,
    Trash2,
    Settings2,
    FileText,
    ShieldCheck,
    ShieldOff,
    FileWarning,
    Link,
    Clock,
    Layers
} from "lucide-react";

interface Rule {
    id: string;
    agent: string;
    type: "Allow" | "Disallow";
    path: string;
}

const AGENTS = [
    { value: "*", label: "* (All Robots)" },
    { value: "Googlebot", label: "Googlebot" },
    { value: "Bingbot", label: "Bingbot" },
    { value: "Slurp", label: "Slurp (Yahoo)" },
    { value: "DuckDuckBot", label: "DuckDuckBot" },
    { value: "Baiduspider", label: "Baiduspider" },
    { value: "Yandex", label: "Yandex" },
];

export default function RobotsTxtPage() {
    const [rules, setRules] = useState<Rule[]>([
        { id: "init", agent: "*", type: "Disallow", path: "" } // Default: Allow all
    ]);
    const [crawlDelay, setCrawlDelay] = useState("");
    const [sitemapUrl, setSitemapUrl] = useState("");

    // Form State
    const [agent, setAgent] = useState("*");
    const [ruleType, setRuleType] = useState<"Allow" | "Disallow">("Disallow");
    const [path, setPath] = useState("");

    // --- Logic ---

    const output = useMemo(() => {
        // Group rules by User-agent
        const grouped = rules.reduce((acc, rule) => {
            if (!acc[rule.agent]) acc[rule.agent] = [];
            acc[rule.agent].push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);

        let text = "";

        // Build text
        Object.keys(grouped).forEach(ag => {
            text += `User-agent: ${ag}\n`;
            grouped[ag].forEach(r => {
                // If type is Disallow and path is empty, it means "Allow all"
                text += `${r.type}: ${r.path}\n`;
            });

            // Add Crawl-delay (typically applies to the group)
            // We only add it if it's the '*' agent for simplicity or if specifically needed logic exists
            // Standard practice is often global or specific. We'll add it to the * agent block.
            if (ag === "*" && crawlDelay) {
                text += `Crawl-delay: ${crawlDelay}\n`;
            }
            text += "\n";
        });

        if (sitemapUrl) {
            text += `Sitemap: ${sitemapUrl}\n`;
        }

        return text.trim();
    }, [rules, crawlDelay, sitemapUrl]);

    const addRule = () => {
        if (!path && ruleType === "Allow") {
            toast.error("Path is required for Allow rules.");
            return;
        }
        // Allow empty path for Disallow (means allow all)

        const newRule: Rule = {
            id: Math.random().toString(36).substr(2, 9),
            agent,
            type: ruleType,
            path
        };
        setRules(prev => [...prev, newRule]);
        setPath(""); // Reset path input
        toast.success("Rule added.");
    };

    const removeRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    const applyPreset = (type: string) => {
        setRules([]);
        setCrawlDelay("");
        setSitemapUrl("");

        if (type === "allowAll") {
            setRules([{ id: "1", agent: "*", type: "Disallow", path: "" }]);
        } else if (type === "blockAll") {
            setRules([{ id: "1", agent: "*", type: "Disallow", path: "/" }]);
        } else if (type === "wp") {
            setRules([
                { id: "1", agent: "*", type: "Disallow", path: "/wp-admin/" },
                { id: "2", agent: "*", type: "Allow", path: "/wp-admin/admin-ajax.php" }
            ]);
        } else if (type === "blockImages") {
            setRules([
                { id: "1", agent: "Googlebot-Image", type: "Disallow", path: "/" },
                { id: "2", agent: "Bingbot", type: "Disallow", path: "/*.jpg$" },
                { id: "3", agent: "Bingbot", type: "Disallow", path: "/*.png$" },
            ]);
        }
    };

    const downloadFile = () => {
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "robots.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const EditorContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg-secondary)] overflow-auto">
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Rule Builder</span>
                <Bot size={12} />
            </div>

            <div className="p-4 flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--fg-secondary)]">User-agent</label>
                        <select
                            value={agent}
                            onChange={(e) => setAgent(e.target.value)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            {AGENTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--fg-secondary)]">Action</label>
                        <select
                            value={ruleType}
                            onChange={(e) => setRuleType(e.target.value as any)}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="Disallow">Disallow</option>
                            <option value="Allow">Allow</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--fg-secondary)]">Path</label>
                    <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        placeholder="/path/ or /file.html"
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                </div>

                <button onClick={addRule} className="w-full py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-1">
                    <Plus size={14} /> Add Rule
                </button>
            </div>

            {/* Active Rules List */}
            <div className="p-4 flex-1 overflow-auto">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-2">Active Rules ({rules.length})</div>
                <div className="space-y-1">
                    {rules.map((rule, idx) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 bg-[var(--bg)] rounded border border-[var(--border)] group">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-emerald-600">{rule.agent}</span>
                                <span className="text-xs font-mono text-[var(--fg)]">
                                    {rule.type}: <span className="text-[var(--fg-secondary)]">{rule.path || "(All)"}</span>
                                </span>
                            </div>
                            <button onClick={() => removeRule(rule.id)} className="p-1 text-[var(--fg-secondary)] hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-3 flex items-center gap-1"><Settings2 size={12} /> Advanced</div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-[var(--fg-secondary)]" />
                        <input
                            type="number"
                            value={crawlDelay}
                            onChange={(e) => setCrawlDelay(e.target.value)}
                            placeholder="Crawl Delay (sec)"
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Link size={12} className="text-[var(--fg-secondary)]" />
                        <input
                            type="url"
                            value={sitemapUrl}
                            onChange={(e) => setSitemapUrl(e.target.value)}
                            placeholder="Sitemap URL"
                            className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-xs outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1 border-b border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">
                Preview (robots.txt)
            </div>

            {/* Presets */}
            <div className="p-4 border-b border-[var(--border)]">
                <div className="text-xs font-bold text-[var(--fg-secondary)] uppercase mb-2">Quick Presets</div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => applyPreset('allowAll')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-semibold hover:border-emerald-400 transition-colors flex items-center justify-center gap-1">
                        <ShieldCheck size={12} /> Allow All
                    </button>
                    <button onClick={() => applyPreset('blockAll')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-semibold hover:border-emerald-400 transition-colors flex items-center justify-center gap-1">
                        <ShieldOff size={12} /> Block All
                    </button>
                    <button onClick={() => applyPreset('wp')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-semibold hover:border-emerald-400 transition-colors flex items-center justify-center gap-1">
                        <FileWarning size={12} /> WordPress
                    </button>
                    <button onClick={() => applyPreset('blockImages')} className="p-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-xs font-semibold hover:border-emerald-400 transition-colors flex items-center justify-center gap-1">
                        <FileText size={12} /> Block Images
                    </button>
                </div>
            </div>

            {/* Code Preview */}
            <div className="flex-1 min-h-0 border-b border-[var(--border)]">
                <CodeMirrorEditor
                    language="plaintext"
                    value={output}
                    onChange={() => { }}
                />
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Robots.txt Generator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Visual Builder</h3>
                    <p className="text-[var(--fg-secondary)]">Create rules visually without worrying about syntax errors. Group rules by user-agent automatically.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">SEO Best Practices</h3>
                    <p className="text-[var(--fg-secondary)]">Use presets for common CMS configurations or create custom rules to control crawler access to your site.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Robots.txt Generator"
            filename="robots.txt"
            defaultFilename="robots.txt"
            extension="txt"
            toolId="robots-txt"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(output); toast.success("Copied to clipboard!"); }}
            onDownload={downloadFile}
        />
    );
}