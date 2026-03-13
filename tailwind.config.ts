import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
    darkMode: "class", // Force class-based dark mode
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)"],
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            animation: {
                gradient: 'gradient 3s ease infinite',
            },
        },
    },
    plugins: [typography],
};
export default config;