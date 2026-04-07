'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                        <div className="absolute -inset-1.5 bg-blue-500/20 rounded-[2.1rem] blur-[2px] animate-pulse-fast"></div>

                        <div className="relative w-20 h-20 bg-zinc-900 rounded-[1.8rem] flex items-center justify-center p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border-2 border-blue-500/30 animate-in zoom-in duration-700">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 7.5V16.5M21 7.5L12 3L3 7.5M21 7.5L12 12M12 12L3 7.5M12 12V21M3 7.5V16.5M3 16.5L12 21M12 21L21 16.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.5 9.75L12 12L16.5 9.75" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight lowercase">wip<span className="text-blue-500 font-extrabold">.</span></h2>

                        {/* Loading Indicator: Circle Spinner on the left, "initialising" on the right */}
                        <div className="flex items-center gap-3 px-5 py-2.5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                            <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">initialising</span>
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
        <div className="h-screen flex flex-col bg-[#f1f5f9] font-sans selection:bg-blue-600 selection:text-white antialiased text-[#1f2937] overflow-hidden">

            {/* 1. Header Area (Full Width or Padded) */}
            <div className="">
                <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />
            </div>

            {/* 2. Main Container (Sidebar + Content) */}
            <div className="flex-1 flex overflow-hidden w-full relative">

                {/* Desktop Floating Sidebar Area (Left) */}
                <div className="hidden lg:flex p-2 pr-0 flex-col h-full z-50 shrink-0">
                    <AdminSidebar />
                </div>

                {/* Content Area (Right) */}
                <div className="flex-1 flex flex-col min-w-0 h-full p-2 relative">
                    {/* Scrollable Content Card */}
                    <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-10 transition-all bg-white shadow-sm border border-zinc-50 rounded-2xl relative scroll-smooth hover-scrollbar">
                        <div key={pathname} className="animate-page-in w-full h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* 3. Mobile Sidebar Overlay (Drawer) */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] flex">
                    {/* Backdrop with transition */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    {/* Sidebar Container with sliding animation */}
                    <div className="relative w-[280px] p-2 h-full animate-in slide-in-from-left-full duration-500 ease-out flex flex-col">
                        <div className="flex-1 h-full shadow-2xl rounded-2xl overflow-hidden bg-[#111827]">
                            <AdminSidebar isMobile onClose={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
