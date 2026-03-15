"use client";

import { useState, useEffect, useMemo } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import CodeMirrorEditor from "@/components/ui/CodeMirrorEditor";
import { toast } from "sonner";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Lock,
    ShieldCheck,
    ShieldAlert,
    Unlock
} from "lucide-react";

type JwtPart = {
    header: any;
    payload: any;
    signature: string;
    error?: string;
};

type TokenStatus = "valid" | "expired" | "invalid" | "empty";

// --- Utilities ---

function decodeBase64Url(str: string): string {
    try {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: break;
            case 2: output += '=='; break;
            case 3: output += '='; break;
            default: throw new Error('Invalid Base64Url string');
        }
        const decoded = atob(output);
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    } catch (e) {
        throw new Error("Invalid encoding");
    }
}

function stringToBytes(str: string): Uint8Array {
    return new TextEncoder().encode(str);
}

function base64UrlToBytes(base64Url: string): Uint8Array {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// --- Component ---

export default function JwtDecoderPage() {
    const [token, setToken] = useState("");
    const [secret, setSecret] = useState("");
    const [sigStatus, setSigStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");

    const { parts, status, expMessage } = useMemo(() => {
        if (!token.trim()) {
            return { parts: { header: {}, payload: {}, signature: "" }, status: "empty", expMessage: "" };
        }

        try {
            const segments = token.split('.');
            if (segments.length !== 3) throw new Error("Invalid JWT format");

            const header = JSON.parse(decodeBase64Url(segments[0]));
            const payload = JSON.parse(decodeBase64Url(segments[1]));
            const signature = segments[2];

            let currentStatus: TokenStatus = "valid";
            let expMsg = "";

            if (payload.exp) {
                const now = Math.floor(Date.now() / 1000);
                if (now >= payload.exp) {
                    currentStatus = "expired";
                    expMsg = `Expired on ${new Date(payload.exp * 1000).toLocaleString()}`;
                } else {
                    const mins = Math.floor((payload.exp - now) / 60);
                    expMsg = `Valid for ${mins} minutes`;
                }
            }

            if (payload.nbf && Math.floor(Date.now() / 1000) < payload.nbf) {
                currentStatus = "invalid";
                expMsg = "Token not yet valid";
            }

            return { parts: { header, payload, signature }, status: currentStatus, expMessage: expMsg };

        } catch (e: any) {
            return { parts: { header: {}, payload: {}, signature: "", error: e.message }, status: "invalid", expMessage: e.message };
        }
    }, [token]);

    useEffect(() => {
        setSigStatus("idle");
    }, [token, secret]);

    const verifySignature = async () => {
        if (!token || !secret) {
            toast.error("Enter token and secret");
            return;
        }

        setSigStatus("verifying");

        try {
            const segments = token.split('.');
            const data = stringToBytes(segments[0] + '.' + segments[1]);
            const signatureBytes = base64UrlToBytes(segments[2]);
            const keyData = stringToBytes(secret);

            // FIX: Cast to BufferSource to satisfy strict TypeScript DOM definitions
            // This resolves the incompatibility between Uint8Array<ArrayBufferLike> and BufferSource
            const key = await crypto.subtle.importKey(
                'raw',
                keyData as BufferSource,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const isValid = await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBytes as BufferSource,
                data as BufferSource
            );

            setSigStatus(isValid ? "valid" : "invalid");

        } catch (e) {
            console.error(e);
            setSigStatus("invalid");
            toast.error("Verification failed (Invalid format)");
        }
    };

    const Controls = (
        <div className="flex items-center gap-4 h-full text-xs text-[var(--fg-secondary)]">
            <span className="font-medium">Algorithm: <span className="text-[var(--accent)] font-mono">{parts.header.alg || "None"}</span></span>
            <span className="font-medium">Type: <span className="text-[var(--accent)] font-mono">{parts.header.typ || "None"}</span></span>
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col">
            <div className="bg-[var(--bg-secondary)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider">
                Encoded JWT
            </div>
            <div className="flex-1 min-h-0">
                <CodeMirrorEditor
                    language="plaintext"
                    placeholder="Paste your JWT token here..."
                    value={token}
                    onChange={setToken}
                />
            </div>
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)] overflow-auto">
            <div className="flex-shrink-0 p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {status === "expired" ? <Clock className="text-orange-500" size={18} /> :
                            status === "valid" ? <CheckCircle className="text-green-500" size={18} /> :
                                <AlertCircle className="text-red-500" size={18} />}
                        <span className={`font-semibold ${status === 'expired' ? 'text-orange-600' :
                            status === 'valid' ? 'text-green-600' :
                                status === 'invalid' ? 'text-red-600' : 'text-[var(--fg-secondary)]'
                            }`}>
                            {status === "empty" ? "Waiting for input" :
                                status === "invalid" ? "Invalid Token" :
                                    status === "expired" ? "Token Expired" : "Token Valid"}
                        </span>
                    </div>
                    <span className="text-xs text-[var(--fg-secondary)]">{expMessage}</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto divide-y divide-[var(--border)]">
                <div className="p-4">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lock size={12} /> Header
                    </h3>
                    <pre className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded overflow-x-auto text-[var(--fg)]">
                        {parts.error ? "Error decoding" : JSON.stringify(parts.header, null, 2)}
                    </pre>
                </div>

                <div className="p-4">
                    <h3 className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Unlock size={12} /> Payload
                    </h3>
                    <pre className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded overflow-x-auto text-[var(--fg)]">
                        {parts.error ? "Error decoding" : JSON.stringify(parts.payload, null, 2)}
                    </pre>
                </div>

                <div className="p-4">
                    <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <ShieldCheck size={12} /> Signature
                    </h3>
                    <div className="text-xs font-mono bg-[var(--bg-secondary)] p-3 rounded overflow-x-auto text-[var(--fg-secondary)] break-all mb-3">
                        {parts.signature || "..."}
                    </div>

                    <div className="mt-4 space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="Enter secret to verify HS256 signature"
                                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                                onClick={verifySignature}
                                disabled={sigStatus === "verifying"}
                                className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {sigStatus === "verifying" ? "Checking..." : "Verify"}
                            </button>
                        </div>

                        {sigStatus !== "idle" && (
                            <div className={`flex items-center gap-2 text-xs font-medium ${sigStatus === 'valid' ? 'text-green-600' : sigStatus === 'verifying' ? 'text-blue-500' : 'text-red-500'}`}>
                                {sigStatus === "valid" ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                {sigStatus === "valid" ? "Signature Verified" : sigStatus === "verifying" ? "Verifying..." : "Signature Invalid"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">JWT Decoder & Debugger</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Secure Client-Side Decoding</h3>
                    <p className="text-[var(--fg-secondary)]">Decodes JWTs directly in your browser. No data is sent to external servers.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Signature Verification</h3>
                    <p className="text-[var(--fg-secondary)]">Verify HS256 token signatures using the native Web Crypto API for maximum security and speed.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="JWT Decoder"
            filename="jwt.txt"
            defaultFilename="jwt.txt"
            extension="txt"
            toolId="jwt"
            toolbarSlot={Controls}
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={() => { navigator.clipboard.writeText(token); toast.success("Token copied!"); }}
            onDownload={() => {
                const blob = new Blob([token], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "token.txt";
                a.click();
            }}
        />
    );
}