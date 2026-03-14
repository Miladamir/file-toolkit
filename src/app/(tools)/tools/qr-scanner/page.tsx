"use client";

import { useEffect, useRef, useState } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { Camera, StopCircle, Upload, ExternalLink, Copy, Trash2, History } from "lucide-react";

export default function QRScannerPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load history from local storage
    useEffect(() => {
        const saved = localStorage.getItem("qr-history");
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, []);

    // --- Camera Logic ---
    const startCamera = async () => {
        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode("reader");
            }

            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleSuccess(decodedText);
                    stopCamera(); // Stop after success
                },
                () => { } // Ignore scan failures
            );
            setIsScanning(true);
            setResult(null);
        } catch (err) {
            console.error(err);
            toast.error("Could not start camera. Please check permissions.");
        }
    };

    const stopCamera = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
            setIsScanning(false);
        }
    };

    // --- File Logic ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        scannerRef.current.scanFile(file, true)
            .then(decodedText => {
                handleSuccess(decodedText);
            })
            .catch(() => {
                toast.error("No QR code found in image.");
            });
    };

    // --- Result & History Logic ---
    const handleSuccess = (text: string) => {
        setResult(text);

        // Add to history
        const newHistory = [text, ...history.filter(h => h !== text)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem("qr-history", JSON.stringify(newHistory));
        toast.success("QR Code scanned!");
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("qr-history");
        toast.success("History cleared");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const isUrl = (text: string) => {
        try { new URL(text); return true; }
        catch { return false; }
    };

    const Controls = (
        <div className="flex flex-col h-full">
            {/* Camera View */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
                <div id="reader" className="w-full h-full" />
                {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-400">
                        <Camera size={48} strokeWidth={1} />
                        <p className="mt-2 text-sm">Camera Off</p>
                    </div>
                )}
            </div>

            {/* Control Buttons */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)] flex flex-col gap-3">
                <div className="flex gap-2">
                    {!isScanning ? (
                        <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                            <Camera size={18} /> Start Camera
                        </button>
                    ) : (
                        <button onClick={stopCamera} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                            <StopCircle size={18} /> Stop Camera
                        </button>
                    )}
                </div>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                >
                    <Upload className="mx-auto mb-1 text-[var(--fg-secondary)]" size={20} />
                    <p className="text-sm text-[var(--fg-secondary)]">Upload an image</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>
            </div>
        </div>
    );

    const Preview = (
        <div className="h-full flex flex-col bg-[var(--bg)]">
            {/* Current Result */}
            <div className="p-4 border-b border-[var(--border)]">
                <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider mb-2">Result</h3>
                {result ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
                        <p className="font-mono text-sm break-all text-[var(--fg)]">{result}</p>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => copyToClipboard(result)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--bg)] border border-[var(--border)] rounded hover:bg-[var(--bg-secondary)] transition-colors">
                                <Copy size={12} /> Copy
                            </button>
                            {isUrl(result) && (
                                <a href={result} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-white rounded hover:opacity-90 transition-colors">
                                    <ExternalLink size={12} /> Open
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--fg-secondary)] text-sm">
                        Scan a code to see result
                    </div>
                )}
            </div>

            {/* History */}
            <div className="flex-1 overflow-auto p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex items-center gap-1">
                        <History size={12} /> History
                    </h3>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="text-[10px] text-[var(--accent)] font-medium hover:underline">Clear</button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-4 text-xs text-[var(--fg-secondary)]">No history</div>
                ) : (
                    <div className="space-y-1">
                        {history.map((item, i) => (
                            <div key={i} className="group flex items-center justify-between p-2 rounded hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors" onClick={() => setResult(item)}>
                                <span className="text-xs font-mono truncate pr-2">{item}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(item); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--accent)] transition-opacity"
                                >
                                    <Copy size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Online QR Code Scanner</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Camera Scanning</h3>
                    <p className="text-[var(--fg-secondary)]">Use your device's camera to scan QR codes in real-time. Supports all standard QR and barcodes.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Image Upload</h3>
                    <p className="text-[var(--fg-secondary)]">Have a screenshot? Upload an image file to extract the QR code data instantly.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="QR Scanner"
            filename="scan.txt"
            defaultFilename="scan.txt"
            extension="txt"
            toolId="qr-scanner"
            editorSlot={Controls}
            previewSlot={Preview}
            seoContent={SeoContent}
            onCopy={() => result ? copyToClipboard(result) : toast.error("No result to copy")}
            onDownload={() => toast.info("Use the copy button to save results.")}
        />
    );
}