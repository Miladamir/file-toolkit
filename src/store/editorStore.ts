import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FileState {
    content: string;
    filename: string;
    language: string;
    toolId: string | null; // New: Track which tool owns this content

    setContent: (content: string) => void;
    setFileAuto: (filename: string, content: string) => void;
    clearFile: () => void;
    setActiveTool: (toolId: string, defaultFilename: string, language: string) => void;
}

export const useFileStore = create<FileState>()(
    persist(
        (set, get) => ({
            content: "",
            filename: "untitled",
            language: "plaintext",
            toolId: null,

            setContent: (content) => set({ content }),

            setFileAuto: (filename, content) => {
                const language = getLanguageFromExtension(filename);
                set({ filename, content, language });
            },

            clearFile: () => set({ content: "", filename: "untitled", language: "plaintext" }),

            // New: Call this when entering a tool page
            setActiveTool: (toolId, defaultFilename, language) => {
                // If the tool ID is different, clear the state for the new tool
                if (get().toolId !== toolId) {
                    set({
                        toolId,
                        content: "",
                        filename: defaultFilename,
                        language
                    });
                }
            },
        }),
        {
            name: "file-toolkit-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
        json: "json", html: "html", css: "css", js: "javascript",
        ts: "typescript", md: "markdown", py: "python", sql: "sql",
        xml: "xml", yaml: "yaml", yml: "yaml", csv: "csv",
        txt: "plaintext", svg: "xml",
    };
    return map[ext || ""] || "plaintext";
};