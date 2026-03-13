"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Something went wrong!</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
                An unexpected error occurred. Please try again. If the problem persists, contact support.
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
                Try again
            </button>
        </div>
    );
}