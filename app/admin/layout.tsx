'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { AdminNavbar } from './components/AdminNavbar';
import { AdminSidebar } from './components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="h-20 w-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                        <span className="text-white font-black text-2xl italic tracking-tighter">GL</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce delay-75"></div>
                        <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                        <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce delay-225"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans selection:bg-blue-600 selection:text-white antialiased text-zinc-900 dark:text-zinc-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminNavbar />
                <main className="flex-1 overflow-y-auto px-12 py-12 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-3xl shadow-inner-2xl rounded-tl-[3.5rem] border-t border-l border-zinc-100 dark:border-zinc-900 transition-all duration-700">
                    {children}
                </main>
            </div>
        </div>
    );
}
