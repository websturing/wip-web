'use client';

import { HeaderProvider } from '@/app/contexts/HeaderContext';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useAppName } from '@/hooks/useAppName';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { prefix } = useAppName();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans text-orange-400">
                {/* Minimalist background pulse */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#eff6ff_0%,_transparent_70%)] opacity-40 animate-pulse duration-[4000ms]"></div>

                <div className="flex flex-col items-center gap-12 relative z-10">
                    {/* Logo with Blinking Border Animation */}
                    <div className="relative">
                        {/* Blinking border effect around the container */}
                        <div className="absolute -inset-1.5 bg-theme-secondary/20 rounded-[2.1rem] blur-[2px] animate-pulse-fast"></div>

                        <div className="relative w-20 h-20 bg-theme-bg-secondary rounded-[1.8rem] flex items-center justify-center p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border-2 border-theme-secondary/30 animate-in zoom-in duration-700">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 7.5V16.5M21 7.5L12 3L3 7.5M21 7.5L12 12M12 12L3 7.5M12 12V21M3 7.5V16.5M3 16.5L12 21M12 21L21 16.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.5 9.75L12 12L16.5 9.75" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-theme-text-main tracking-tight lowercase">{prefix}<span className="text-theme-secondary font-extrabold">.</span></h2>

                        {/* Loading Indicator: Circle Spinner on the left, "initialising" on the right */}
                        <div className="flex items-center gap-3 px-5 py-2.5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                            <div className="w-4 h-4 border-2 border-theme-secondary/20 border-t-theme-secondary rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-text-muted">initialising</span>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes pulse-fast {
                        0%, 100% { opacity: 0.2; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.05); }
                    }
                    .animate-pulse-fast {
                        animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen flex flex-col font-sans selection:bg-theme-primary selection:text-white antialiased text-theme-text-main overflow-hidden relative">
            {/* iOS-style animated gradient background */}
            <div className="fixed inset-0 bg-[var(--background)] -z-10">
                {/* Gradient mesh blobs - vivid for glass effect */}
                <div className="absolute top-[-15%] left-[-5%] w-[65%] h-[65%] rounded-full bg-gradient-to-br from-blue-300/50 via-indigo-200/40 to-transparent blur-3xl dark:from-blue-900/20 dark:via-indigo-900/15 animate-pulse duration-[8000ms]"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[55%] h-[55%] rounded-full bg-gradient-to-tl from-violet-300/40 via-pink-200/30 to-transparent blur-3xl dark:from-purple-900/15 dark:via-pink-900/10 animate-pulse duration-[12000ms] delay-1000"></div>
                <div className="absolute top-[25%] right-[15%] w-[35%] h-[35%] rounded-full bg-gradient-to-bl from-cyan-200/35 via-sky-200/25 to-transparent blur-3xl dark:from-cyan-900/10 dark:via-sky-900/5 animate-pulse duration-[10000ms] delay-500"></div>
                <div className="absolute bottom-[20%] left-[25%] w-[25%] h-[25%] rounded-full bg-gradient-to-tr from-amber-100/25 via-orange-100/15 to-transparent blur-3xl dark:from-amber-900/5 dark:via-orange-900/5 animate-pulse duration-[14000ms] delay-2000"></div>
                {/* Subtle noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
            </div>

            <HeaderProvider>
                {/* Main Container (Sidebar + Content) */}
                <div className="flex-1 flex overflow-hidden w-full relative">

                    {/* Desktop Floating Sidebar Area (Left) - Glass */}
                    <div className="hidden lg:flex p-2 pr-0 flex-col h-full z-50 shrink-0">
                        <AdminSidebar />
                    </div>

                    {/* Content Area (Right) */}
                    <div
                        className="flex-1 flex flex-col min-w-0 h-full p-2 relative overflow-y-auto hover-scrollbar"
                        onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
                    >

                        {/* Header Area (Inside Content) - Glass */}
                        <div className="sticky top-0 z-50 mb-2 transition-all duration-300">
                            <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} isScrolled={isScrolled} />
                        </div>

                        {/* Scrollable Content Card - Glass */}
                        <main className="flex-1 px-6 py-6 lg:px-10 lg:py-10 transition-all rounded-xl relative scroll-smooth"

                        >
                            <div key={pathname} className="animate-page-in w-full h-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>

                {/* Mobile Sidebar Overlay (Drawer) */}
                {isSidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-[100] flex">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setIsSidebarOpen(false)}
                        />

                        {/* Sidebar Container */}
                        <div className="relative w-[280px] p-2 h-full animate-in slide-in-from-left-full duration-500 ease-out flex flex-col">
                            <div className="flex-1 h-full shadow-2xl rounded-2xl overflow-hidden"
                                style={{
                                    background: 'var(--theme-bg-secondary)',
                                    backdropFilter: `blur(var(--theme-glass-blur)) saturate(var(--theme-glass-saturate))`,
                                    WebkitBackdropFilter: `blur(var(--theme-glass-blur)) saturate(var(--theme-glass-saturate))`,
                                    border: 'var(--theme-glass-border)',
                                }}
                            >
                                <AdminSidebar isMobile onClose={() => setIsSidebarOpen(false)} />
                            </div>
                        </div>
                    </div>
                )}
            </HeaderProvider>
        </div>
    );
}
