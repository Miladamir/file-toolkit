import {
    FileJson, Code2, FileText, Terminal, Palette, Database,
    FileSpreadsheet, FileCode, FileType, FileCog, Braces,
    LucideIcon, ScanLine, QrCode, Barcode, ShieldCheck
} from "lucide-react";

export type ToolConfig = {
    id: string;
    name: string;
    description: string;
    extension: string;
    language: string;
    icon: LucideIcon;
    category: "Web" | "Data" | "Code" | "Text" | "Utility";
    hasPreview?: boolean;
    previewType?: "html" | "markdown" | "csv" | "svg";
    hasActions?: boolean;
    isSpecialLayout?: boolean;
    SpecialComponent?: React.ComponentType;
};

export const tools: ToolConfig[] = [
    // --- Web ---
    {
        id: "html", name: "HTML Editor", description: "Edit and preview HTML code live.",
        extension: "html", language: "html", icon: Code2, category: "Web",
        hasPreview: true, previewType: "html"
    },
    {
        id: "css", name: "CSS Editor", description: "Write and format CSS styles.",
        extension: "css", language: "css", icon: Palette, category: "Web",
        hasActions: true
    },
    {
        id: "javascript", name: "JavaScript Editor", description: "Write and run JS code.",
        extension: "js", language: "javascript", icon: Braces, category: "Web",
        hasActions: true
    },
    {
        id: "typescript", name: "TypeScript Editor", description: "Write TypeScript code with syntax support.",
        extension: "ts", language: "typescript", icon: FileCode, category: "Web"
    },
    {
        id: "svg", name: "SVG Viewer", description: "Edit and preview SVG vector images.",
        extension: "svg", language: "xml", icon: FileCode, category: "Web",
        hasPreview: true, previewType: "svg", hasActions: true
    },

    // --- Data ---
    {
        id: "json", name: "JSON Formatter", description: "Format, validate, and minify JSON.",
        extension: "json", language: "json", icon: FileJson, category: "Data",
        hasActions: true
    },
    {
        id: "xml", name: "XML Editor", description: "Format and validate XML data.",
        extension: "xml", language: "xml", icon: FileCode, category: "Data",
        hasActions: true
    },
    {
        id: "yaml", name: "YAML Editor", description: "Convert and edit YAML configurations.",
        extension: "yaml", language: "yaml", icon: FileCog, category: "Data",
        hasActions: true
    },
    {
        id: "csv", name: "CSV Viewer", description: "View and edit CSV files in a grid.",
        extension: "csv", language: "csv", icon: FileSpreadsheet, category: "Data",
        hasPreview: true, previewType: "csv"
    },
    {
        id: "sql", name: "SQL Editor", description: "Write and format SQL queries.",
        extension: "sql", language: "sql", icon: Database, category: "Data",
        hasActions: true
    },

    // --- Code ---
    {
        id: "python", name: "Python Editor", description: "Write Python scripts with syntax highlighting.",
        extension: "py", language: "python", icon: Terminal, category: "Code",
        hasActions: true
    },
    {
        id: "c", name: "C Editor", description: "Write C code with syntax highlighting.",
        extension: "c", language: "c", icon: FileCode, category: "Code",
        hasActions: true
    },
    {
        id: "cpp", name: "C++ Editor", description: "Write C++ code with syntax highlighting.",
        extension: "cpp", language: "cpp", icon: FileCode, category: "Code",
        hasActions: true
    },
    {
        id: "java", name: "Java Editor", description: "Write Java code with syntax highlighting.",
        extension: "java", language: "java", icon: FileCode, category: "Code",
        hasActions: true
    },
    {
        id: "php", name: "PHP Editor", description: "Write PHP code with syntax highlighting.",
        extension: "php", language: "php", icon: FileCode, category: "Code",
        hasActions: true
    },

    // --- Text ---
    {
        id: "markdown", name: "Markdown Editor", description: "Write and preview Markdown documents.",
        extension: "md", language: "markdown", icon: FileText, category: "Text",
        hasPreview: true, previewType: "markdown"
    },
    {
        id: "text", name: "Text Editor", description: "Simple plain text editor with stats.",
        extension: "txt", language: "plaintext", icon: FileType, category: "Text"
    },

    // --- Utility ---
    {
        id: "diff", name: "Diff Checker", description: "Compare two texts and find differences.",
        extension: "diff", language: "plaintext", icon: FileCode, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "regex", name: "Regex Tester", description: "Build and test Regular Expressions.",
        extension: "regex", language: "plaintext", icon: FileCode, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "color", name: "Color Converter", description: "Convert between HEX, RGB, and HSL colors.",
        extension: "color", language: "plaintext", icon: Palette, category: "Utility",
        isSpecialLayout: true
    },
    // New Generators
    {
        id: "qr-scanner", name: "QR Scanner", description: "Scan QR codes via camera or image.",
        extension: "qr", language: "plaintext", icon: ScanLine, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "qr-generator", name: "QR Generator", description: "Create customizable QR codes.",
        extension: "qr", language: "plaintext", icon: QrCode, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "barcode", name: "Barcode Generator", description: "Generate CODE128, EAN, UPC barcodes.",
        extension: "barcode", language: "plaintext", icon: Barcode, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "password", name: "Password Generator", description: "Generate secure random passwords.",
        extension: "pwd", language: "plaintext", icon: ShieldCheck, category: "Utility",
        isSpecialLayout: true
    }
];

export function getToolById(id: string): ToolConfig | undefined {
    return tools.find(tool => tool.id === id);
}