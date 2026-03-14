import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        // Security: Prevent malicious code or infinite loops by setting a timeout (e.g., 5s)
        // We write code to a temp file or pipe it in. Piping is cleaner for simple scripts.
        // Note: 'python3' is standard on Linux/Mac/Vercl. Use 'python' on Windows locally if needed.
        const command = `python3 -c "${code.replace(/"/g, '\\"')}"`;

        const { stdout, stderr } = await execAsync(command, {
            timeout: 5000, // 5 second timeout
            maxBuffer: 1024 * 1024, // 1MB buffer
        });

        return NextResponse.json({
            stdout: stdout,
            stderr: stderr,
        });

    } catch (error: any) {
        // Handle errors (syntax errors, runtime errors, or timeout)
        console.error("Python Execution Error:", error);

        // If error has stdout/stderr (common in script errors), return them
        return NextResponse.json({
            stdout: error.stdout || "",
            stderr: error.stderr || error.message || "Execution failed",
        });
    }
}