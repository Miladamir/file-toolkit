import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-8xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Page Not Found</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Sorry, we couldn't find the tool or page you're looking for.
            </p>
            <Link
                href="/"
                className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors font-medium"
            >
                Go back Home
            </Link>
        </div>
    );
}