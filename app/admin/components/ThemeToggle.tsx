'use client';

import { Icon } from '@/app/components/ui/Icon';
import { useTheme } from "next-themes";
import * as React from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-9 w-9"></div>;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-[var(--theme-glass-hover-bg)] text-theme-text-main transition-all duration-300 hover:scale-105 active:scale-95 border border-theme-border cursor-pointer"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon */}
                <Icon
                    icon="solar:sun-bold-duotone"
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                        }`}
                />
                {/* Moon Icon */}
                <Icon
                    icon="solar:moon-bold-duotone"
                    className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>
        </button>
    );
}
