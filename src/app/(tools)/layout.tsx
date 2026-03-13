import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--bg)]">
            <Header />
            {/* pt-16 creates space for the fixed header above */}
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}