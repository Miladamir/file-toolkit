"use client";

import { useFileStore } from "@/store/editorStore";
import { toast } from "sonner";
import { Code2 } from "lucide-react";

// Map of Language -> Hello World Code
const snippets: Record<string, string> = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    php: `<?php
echo "Hello, World!";
?>`,
    python: `print("Hello, World!")`,
};

interface Props {
    language: string;
}

export default function BoilerPlateActions({ language }: Props) {
    const { setContent, content } = useFileStore();

    const handleInsert = () => {
        const code = snippets[language];
        if (code) {
            setContent(code);
            toast.success("Boilerplate inserted!");
        } else {
            toast.error("No boilerplate available for this language.");
        }
    };

    return (
        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 ml-2">
            <button
                onClick={handleInsert}
                disabled={!!content} // Disable if editor already has content
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Insert Boilerplate Code"
            >
                <Code2 className="h-3.5 w-3.5" />
                Boilerplate
            </button>
        </div>
    );
}