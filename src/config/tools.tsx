import {
    FileJson, Code2, FileText, Terminal, Palette, Database,
    FileSpreadsheet, FileCode, FileType, FileCog, Braces,
    LucideIcon, ScanLine, QrCode, Barcode, ShieldCheck,
    // Existing New Icons
    Link, Key, Image, FileImage, Layers, FileKey2, Fingerprint,
    // Added Icons for Phases 37-50
    Sparkles, Split, Minimize2, FileSearch, Scale, Calendar, Activity, Clock, Type, Droplet, Square, Maximize2, Bot, Server
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
    // Generators & Scanners
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
    },
    {
        id: "uuid", name: "UUID Generator", description: "Generate UUIDs and GUIDs.",
        extension: "uuid", language: "plaintext", icon: Fingerprint, category: "Utility",
        isSpecialLayout: true
    },
    // Encoders
    {
        id: "base64", name: "Base64 Encoder", description: "Encode and decode Base64 strings.",
        extension: "b64", language: "plaintext", icon: FileCode, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "url-encoder", name: "URL Encoder", description: "Encode and decode URL components.",
        extension: "url", language: "plaintext", icon: Link, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "html-entities", name: "HTML Entities", description: "Encode and decode HTML entities.",
        extension: "html", language: "plaintext", icon: Code2, category: "Utility",
        isSpecialLayout: true
    },
    // Security
    {
        id: "md5", name: "MD5 Generator", description: "Generate MD5 hash for text and files.",
        extension: "md5", language: "plaintext", icon: FileKey2, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "sha256", name: "SHA-256 Generator", description: "Generate SHA-256 hash for data.",
        extension: "sha256", language: "plaintext", icon: FileKey2, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "jwt", name: "JWT Decoder", description: "Decode and verify JSON Web Tokens.",
        extension: "jwt", language: "plaintext", icon: Key, category: "Utility",
        isSpecialLayout: true
    },
    // Image Tools
    {
        id: "image-compressor", name: "Image Compressor", description: "Compress and resize images.",
        extension: "img", language: "plaintext", icon: Image, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "jpg-to-png", name: "JPG to PNG", description: "Convert JPG images to PNG format.",
        extension: "png", language: "plaintext", icon: FileImage, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "png-to-jpg", name: "PNG to JPG", description: "Convert PNG images to JPG format.",
        extension: "jpg", language: "plaintext", icon: FileImage, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPG.",
        extension: "jpg", language: "plaintext", icon: FileImage, category: "Utility",
        isSpecialLayout: true
    },
    // PDF Tools
    {
        id: "image-to-pdf", name: "Image to PDF", description: "Convert images to PDF format.",
        extension: "pdf", language: "plaintext", icon: FileText, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "pdf-merge", name: "Merge PDF", description: "Combine multiple PDF files into one.",
        extension: "pdf", language: "plaintext", icon: Layers, category: "Utility",
        isSpecialLayout: true
    },
    // New Tools (Phase 37-50)
    {
        id: "svg-optimizer", name: "SVG Optimizer", description: "Clean and minify SVG code.",
        extension: "svg", language: "xml", icon: Sparkles, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "pdf-split", name: "Split PDF", description: "Extract pages from PDF files.",
        extension: "pdf", language: "plaintext", icon: Split, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "pdf-compress", name: "Compress PDF", description: "Reduce PDF file size.",
        extension: "pdf", language: "plaintext", icon: Minimize2, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "pdf-text-extractor", name: "PDF Text Extractor", description: "Extract text from PDF files.",
        extension: "txt", language: "plaintext", icon: FileSearch, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "unit-converter", name: "Unit Converter", description: "Convert length, weight, and temperature.",
        extension: "txt", language: "plaintext", icon: Scale, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "age-calculator", name: "Age Calculator", description: "Calculate exact age from date of birth.",
        extension: "txt", language: "plaintext", icon: Calendar, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "bmi-calculator", name: "BMI Calculator", description: "Calculate Body Mass Index.",
        extension: "txt", language: "plaintext", icon: Activity, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "timestamp", name: "Timestamp Converter", description: "Convert Unix timestamps to dates.",
        extension: "txt", language: "plaintext", icon: Clock, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "roman-numeral", name: "Roman Numeral", description: "Convert numbers to Roman numerals.",
        extension: "txt", language: "plaintext", icon: Type, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "css-gradient", name: "CSS Gradient", description: "Generate CSS gradient backgrounds.",
        extension: "css", language: "css", icon: Droplet, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "box-shadow", name: "Box Shadow", description: "Generate CSS box shadows visually.",
        extension: "css", language: "css", icon: Square, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "border-radius", name: "Border Radius", description: "Generate CSS border-radius values.",
        extension: "css", language: "css", icon: Maximize2, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "robots-txt", name: "Robots.txt Generator", description: "Generate robots.txt files for SEO.",
        extension: "txt", language: "plaintext", icon: Bot, category: "Utility",
        isSpecialLayout: true
    },
    {
        id: "htaccess", name: ".htaccess Generator", description: "Generate Apache .htaccess configurations.",
        extension: "conf", language: "plaintext", icon: Server, category: "Utility",
        isSpecialLayout: true
    }
];

export function getToolById(id: string): ToolConfig | undefined {
    return tools.find(tool => tool.id === id);
}