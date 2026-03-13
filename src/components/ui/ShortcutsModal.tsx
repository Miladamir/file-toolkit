"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

const shortcuts = [
    {
        category: "Global", items: [
            { key: "Ctrl + K", description: "Open Command Palette" },
            { key: "Ctrl + S", description: "Download File" },
            { key: "?", description: "Show Shortcuts" },
        ]
    },
    {
        category: "Editor", items: [
            { key: "Ctrl + B", description: "Toggle Sidebar (Future)" },
            { key: "Ctrl + Shift + F", description: "Format Document (If supported)" },
        ]
    }
];

export default function ShortcutsModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "?") {
                // Only trigger if not typing in an input
                const target = e.target as HTMLElement;
                if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden focus:outline-none p-6">
                    <Dialog.Title className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                        Keyboard Shortcuts
                    </Dialog.Title>

                    <div className="space-y-4">
                        {shortcuts.map((group) => (
                            <div key={group.category}>
                                <h3 className="text-xs font-bold uppercase text-zinc-400 mb-2">{group.category}</h3>
                                <div className="space-y-2">
                                    {group.items.map((item) => (
                                        <div key={item.key} className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-600 dark:text-zinc-300">{item.description}</span>
                                            <kbd className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-500">
                                                {item.key}
                                            </kbd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Dialog.Close asChild>
                        <button
                            className="absolute top-4 right-4 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}