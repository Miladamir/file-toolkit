import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-[var(--card-border)] bg-[var(--bg-secondary)] transition-colors">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] rounded-lg flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </div>
                            <span className="font-bold text-[var(--fg)]">ToolKit</span>
                        </div>
                        <p className="text-sm text-[var(--fg-secondary)] max-w-xs">
                            Professional file tools for developers. Fast, private, and browser-based.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><Link href="/tools" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">All Tools</Link></li>
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">API</Link></li>
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Privacy</Link></li>
                            <li><Link href="#" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--accent)] transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[var(--card-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-[var(--fg-secondary)]">
                        © {new Date().getFullYear()} ToolKit Pro. All rights reserved.
                    </div>
                    {/* Socials Placeholder - Icons would go here */}
                </div>
            </div>
        </footer>
    );
}