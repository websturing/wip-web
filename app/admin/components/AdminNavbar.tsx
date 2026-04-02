'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useEffect, useState } from 'react';

export const AdminNavbar = () => {
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
        <header className="h-[64px] bg-white border-b border-zinc-100 flex items-center justify-between px-10 relative z-40 shadow-sm rounded-bl-[1.5rem] mt-4 mr-4 shadow-zinc-200/50">
            <div className="flex items-center gap-12">
                {/* Logo and App Title matching Image 1 */}
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1 rounded-md shadow-lg shadow-blue-500/20">
                        <span className="text-white font-black text-xs px-1">S</span>
                    </div>
                    <span className="text-[#1f2937] font-black text-[13px] tracking-tight">Sewing Application</span>
                </div>

                {/* Clock matching Image 1 position */}
                <span className="text-[12px] font-bold text-zinc-400 font-mono tracking-tighter">
                    {dateTime}
                </span>
            </div>

            <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer text-zinc-300 hover:text-zinc-600 transition-all pt-1">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    <div className="absolute top-1 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="flex flex-col items-end">
                        <span className="text-[12px] font-black text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight">
                            {user?.email || 'admin@admin.com'}
                        </span>
                    </div>
                    <div className="h-10 w-10 border border-zinc-100 rounded-full flex items-center justify-center p-[2px] transition-all hover:scale-105 shadow-sm overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="avatar"
                            className="w-full h-full rounded-full bg-blue-100"
                        />
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:rotate-180 transition-transform"><path d="m6 9 6 6 6-6" /></svg>
                </div>
            </div>
        </header>
    );
};
