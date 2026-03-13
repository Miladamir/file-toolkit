"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react"; // Using Lucide for consistency

export default function Header() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => setMounted(true), []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)] transition-colors">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-[var(--fg)] tracking-tight">ToolKit</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/tools" className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors">
                        Tools
                    </Link>
                    <Link href="#" className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors">
                        API
                    </Link>
                    <Link href="#" className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg)] transition-colors">
                        Docs
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            className="w-11 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--card-border)] relative transition-colors hover:border-[var(--fg-secondary)]"
                            aria-label="Toggle Theme"
                        >
                            <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center transition-transform duration-300 ${resolvedTheme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}>
                                {resolvedTheme === 'dark' ? (
                                    <Moon className="h-3.5 w-3.5 text-white" />
                                ) : (
                                    <Sun className="h-3.5 w-3.5 text-white" />
                                )}
                            </div>
                        </button>
                    )}

                    <Link href="/tools" className="hidden md:inline-flex items-center px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                        Get Started
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-[var(--fg)]"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-4 pb-2 border-t border-[var(--card-border)] pt-4 flex flex-col gap-4">
                    <Link href="/tools" className="text-[var(--fg-secondary)] font-medium">Tools</Link>
                    <Link href="#" className="text-[var(--fg-secondary)] font-medium">API</Link>
                    <Link href="#" className="text-[var(--fg-secondary)] font-medium">Docs</Link>
                </div>
            )}
        </nav>
    );
}