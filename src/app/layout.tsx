import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["300", "400", "700"]
});

export const metadata: Metadata = {
  title: "ToolKit Pro - Professional File Editing Tools",
  description: "A curated collection of high-quality tools for developers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${merriweather.variable} font-sans antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}