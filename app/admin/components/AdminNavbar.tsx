'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useEffect, useState } from 'react';

interface AdminNavbarProps {
    onToggleSidebar?: () => void;
}

export const AdminNavbar = ({ onToggleSidebar }: AdminNavbarProps) => {
    const { user } = useAuth();
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'short',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            setDateTime(now.toLocaleDateString('id-ID', options).replace(/,/g, ''));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-[64px] bg-white border border-zinc-50 flex items-center justify-between px-6 z-40 shadow-sm rounded-xl transition-all w-full">
            <div className="flex items-center gap-4 lg:gap-12">
                {/* Hamburger menu for mobile */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 lg:hidden text-zinc-500 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>

                {/* Logo and App Title matching Image 1 */}
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1 rounded-md shadow-md">
                        <span className="text-white font-black text-xs px-1">S</span>
                    </div>
                    <span className="text-[#1f2937] font-black text-[13px] tracking-tight hidden sm:inline-block whitespace-nowrap">Sewing Application</span>
                </div>

                {/* Clock matching Image 1 position */}
                <span className="text-[11px] lg:text-[12px] font-bold text-zinc-400 font-mono tracking-tighter whitespace-nowrap hidden md:inline-block">
                    {dateTime}
                </span>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
                <div className="relative group cursor-pointer text-zinc-300 hover:text-zinc-600 transition-all pt-1 hidden xs:block">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    <div className="absolute top-1 right-0 w-2 h-2 bg-red-500 border border-white rounded-full"></div>
                </div>

                <div className="flex items-center gap-3 lg:gap-4 cursor-pointer group">
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] lg:text-[12px] font-black text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight truncate max-w-[120px] sm:max-w-none">
                            {user?.email || 'admin@admin.com'}
                        </span>
                    </div>
                    <div className="h-8 w-8 lg:h-10 lg:w-10 border border-zinc-100 rounded-full flex items-center justify-center p-[1px] transition-all hover:scale-105 shadow-sm overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="avatar"
                            className="w-full h-full rounded-full bg-blue-100"
                        />
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:rotate-180 transition-transform hidden sm:block"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>
        </header>
    );
};
