"use client";

import { useState, useEffect } from "react";
import ToolPageLayout from "@/components/layout/ToolPageLayout";
import { toast } from "sonner";
import {
    CalendarDays,
    Cake,
    Clock,
    Hourglass,
    Sparkles,
    Star,
    CalendarCheck,
    Copy,
    Download
} from "lucide-react";

interface AgeResult {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalWeeks: number;
    totalDays: number;
    totalHours: number;
    nextBirthday: string;
    nextBirthdayDay: string;
    zodiac: string;
}

// --- Logic Helpers ---

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const calculateAge = (birthDate: Date, targetDate: Date): AgeResult | null => {
    if (targetDate < birthDate) return null;

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    // Adjust days
    if (days < 0) {
        months--;
        // Borrow days from the previous month
        const prevMonthDays = getDaysInMonth(targetDate.getFullYear(), targetDate.getMonth() - 1);
        days += prevMonthDays;
    }

    // Adjust months
    if (months < 0) {
        years--;
        months += 12;
    }

    // Totals
    const diffMs = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;

    // Next Birthday
    let nextBday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBday <= targetDate) {
        nextBday.setFullYear(nextBday.getFullYear() + 1);
    }
    const nextBdayStr = nextBday.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const nextBdayDay = nextBday.toLocaleDateString("en-US", { weekday: 'long' });

    // Zodiac
    const zodiac = getZodiacSign(birthDate);

    return {
        years, months, days,
        totalMonths, totalWeeks, totalDays, totalHours,
        nextBirthday: nextBdayStr,
        nextBirthdayDay: nextBdayDay,
        zodiac
    };
};

const getZodiacSign = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries ♈";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus ♉";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini ♊";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer ♋";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo ♌";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo ♍";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra ♎";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio ♏";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius ♐";
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn ♑";
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius ♒";
    return "Pisces ♓";
};

export default function AgeCalculatorPage() {
    const [birthDate, setBirthDate] = useState("");
    const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<AgeResult | null>(null);

    useEffect(() => {
        if (!birthDate || !targetDate) {
            setResult(null);
            return;
        }

        const birth = new Date(birthDate + "T00:00:00");
        const target = new Date(targetDate + "T00:00:00");

        if (target < birth) {
            toast.error("Target date must be after birth date.");
            setResult(null);
            return;
        }

        const res = calculateAge(birth, target);
        setResult(res);
    }, [birthDate, targetDate]);

    const copyResults = () => {
        if (!result) return;
        const text = `Age: ${result.years} Years, ${result.months} Months, ${result.days} Days\nTotal Days: ${result.totalDays}\nZodiac: ${result.zodiac}`;
        navigator.clipboard.writeText(text);
        toast.success("Results copied!");
    };

    const downloadResults = () => {
        if (!result) return;
        const text = `Age Calculation Results\n\nDate of Birth: ${birthDate}\nTarget Date: ${targetDate}\n\nAge: ${result.years} Years, ${result.months} Months, ${result.days} Days\nTotal Months: ${result.totalMonths}\nTotal Weeks: ${result.totalWeeks}\nTotal Days: ${result.totalDays}\nTotal Hours: ${result.totalHours}\n\nNext Birthday: ${result.nextBirthday}\nZodiac Sign: ${result.zodiac}`;

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "age-calculation.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // --- UI Slots ---

    const Controls = (
        <div className="flex flex-col gap-6 h-full overflow-auto p-6 bg-[var(--bg)]">
            <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Date of Birth</label>
                <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg-secondary)] uppercase">Age at Date</label>
                <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => setTargetDate(new Date().toISOString().split('T')[0])} className="text-xs text-indigo-600 hover:underline mt-1">Set to Today</button>
            </div>

            {result && (
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Star size={16} className="text-indigo-600" />
                        <span className="font-semibold text-indigo-800 dark:text-indigo-200">{result.zodiac}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CalendarCheck size={16} className="text-indigo-600" />
                        <div className="text-xs text-indigo-700 dark:text-indigo-300">
                            Next Birthday: <span className="font-bold">{result.nextBirthdayDay}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const EditorContent = (
        <div className="h-full w-full flex flex-col relative bg-[var(--bg-secondary)]">
            <div className="bg-[var(--bg)] px-4 py-1 border-b border-[var(--border)] text-[10px] font-bold text-[var(--fg-secondary)] uppercase tracking-wider flex justify-between">
                <span>Inputs</span>
                <CalendarDays size={12} />
            </div>
            {Controls}
        </div>
    );

    const PreviewContent = (
        <div className="h-full w-full flex flex-col bg-[var(--bg)]">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1 border-b border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider">
                Calculated Age
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
                {!result ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--fg-secondary)] text-sm">
                        <Cake size={32} className="mb-2 opacity-30" />
                        Enter dates to calculate age
                    </div>
                ) : (
                    <>
                        {/* Main Age Card */}
                        <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm">
                            <div className="text-5xl font-bold text-indigo-600 mb-2">{result.years}</div>
                            <div className="text-sm font-medium text-indigo-500">Years</div>
                            <div className="mt-2 text-xs text-[var(--fg-secondary)]">
                                {result.months} Months, {result.days} Days
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard icon={<Hourglass size={16} />} label="Total Months" value={result.totalMonths.toLocaleString()} />
                            <StatCard icon={<Clock size={16} />} label="Total Weeks" value={result.totalWeeks.toLocaleString()} />
                            <StatCard icon={<CalendarDays size={16} />} label="Total Days" value={result.totalDays.toLocaleString()} />
                            <StatCard icon={<Clock size={16} />} label="Total Hours" value={result.totalHours.toLocaleString()} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const SeoContent = (
        <>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-4 border-b border-[var(--border)] pb-2">Age Calculator</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Precise Calculation</h3>
                    <p className="text-[var(--fg-secondary)]">Calculates your exact age in years, months, and days. Accounts for leap years and varying month lengths.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-[var(--fg)] mb-2">Fun Extras</h3>
                    <p className="text-[var(--fg-secondary)]">Find out your zodiac sign and what day of the week your next birthday falls on.</p>
                </div>
            </div>
        </>
    );

    return (
        <ToolPageLayout
            title="Age Calculator"
            filename="age.txt"
            defaultFilename="age.txt"
            extension="txt"
            toolId="age-calculator"
            editorSlot={EditorContent}
            previewSlot={PreviewContent}
            seoContent={SeoContent}
            onCopy={copyResults}
            onDownload={downloadResults}
        />
    );
}

// --- Helper Component ---
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border)] flex flex-col items-center justify-center text-center">
            <div className="text-[var(--fg-secondary)] mb-2">{icon}</div>
            <div className="text-lg font-bold text-[var(--fg)]">{value}</div>
            <div className="text-[10px] text-[var(--fg-secondary)] uppercase tracking-wider">{label}</div>
        </div>
    );
}