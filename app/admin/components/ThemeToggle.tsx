'use client';

import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-10 w-10"></div>;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative h-10 w-10 flex items-center justify-center p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-sm overflow-hidden"
        >
            <div className="relative h-5 w-5">
                <span className={`absolute inset-0 transform transition-all duration-500 scale-100 ${theme === 'dark' ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                    ☀️
                </span>
                <span className={`absolute inset-0 transform transition-all duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
                    🌙
                </span>
            </div>
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
