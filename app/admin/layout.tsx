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
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <span className="text-white font-black text-2xl italic tracking-tighter">GL</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen bg-[#f1f5f9] flex font-sans selection:bg-blue-600 selection:text-white antialiased text-[#1f2937] overflow-hidden">
            {/* Floating Sidebar Area */}
            <div className="p-4 h-full flex flex-col z-50">
                <AdminSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                {/* Navbar within a padding area or sticky? Image shows it at the top */}
                <AdminNavbar />

                {/* Content area with some padding to match Image 1 */}
                <main className="flex-1 overflow-y-auto px-10 py-10 transition-all bg-white shadow-inner-xl mt-4 mr-4 mb-4 rounded-[2rem]">
                    {children}
                </main>
            </div>
        </div>
    );
}
