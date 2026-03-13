"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { tools } from "@/config/tools";
import { cn } from "@/lib/utils";

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden focus:outline-none">

                    {/* Accessibility Fix: Visually Hidden Title */}
                    <Dialog.Title className="sr-only">Command Menu</Dialog.Title>

                    <Command>
                        {/* Search Input */}
                        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700 px-3">
                            <svg className="w-4 h-4 mr-2 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <Command.Input
                                placeholder="Type a command or search..."
                                className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-white"
                            />
                        </div>

                        {/* Results List */}
                        <Command.List className="max-h-80 overflow-y-auto p-2">
                            <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                                No results found.
                            </Command.Empty>

                            {/* Group: Tools */}
                            <Command.Group heading="Tools" className="text-xs text-zinc-500 font-medium mb-2 [&>div]:space-y-1">
                                {tools.map((tool) => (
                                    <Command.Item
                                        key={tool.id}
                                        value={tool.name + " " + tool.id}
                                        onSelect={() => runCommand(() => router.push(`/tools/${tool.id}`))}
                                        className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 text-zinc-900 dark:text-white"
                                    >
                                        <div className="flex items-center gap-2">
                                            <tool.icon className="w-4 h-4 text-zinc-400" />
                                            <span>{tool.name}</span>
                                        </div>
                                        <span className="text-xs text-zinc-400">{tool.category}</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>

                            {/* Group: Navigation */}
                            <Command.Group heading="Navigation" className="text-xs text-zinc-500 font-medium mt-4 mb-2 [&>div]:space-y-1">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/"))}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 text-zinc-900 dark:text-white"
                                >
                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Home
                                </Command.Item>
                            </Command.Group>
                        </Command.List>

                        {/* Footer Hint */}
                        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex gap-2">
                                <kbd className="px-2 py-0.5 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900">ESC</kbd>
                                <span className="text-xs text-zinc-500">to close</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <kbd className="px-2 py-0.5 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900">↑</kbd>
                                <kbd className="px-2 py-0.5 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900">↓</kbd>
                                to navigate
                            </div>
                        </div>
                    </Command>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}