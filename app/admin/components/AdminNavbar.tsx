'use client';

import { Icon } from '@/app/components/ui/Icon';
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
        <header className="h-[52px] flex items-center justify-between pt-2 px-3 z-40 transition-all w-full">

            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1 rounded font-black text-[10px] text-white">W</div>
                <span className="font-black text-xs uppercase tracking-widest">WIP Administrator</span>
            </div>


            <div className="flex items-center gap-4 lg:gap-12 bg-gray-200 p-2 rounded-lg">
                {/* Clock matching Image 1 position */}
                <span className="text-[11px] lg:text-[12px] font-bold  font-mono tracking-tighter whitespace-nowrap hidden md:inline-block">
                    {dateTime}
                </span>
            </div>

            <div className="flex items-center gap-4 lg:gap-8">
                <div className="relative group cursor-pointer text-zinc-400 hover:text-blue-500 transition-all pt-1 hidden xs:block">
                    <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5" />
                    <div className="absolute top-1 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></div>
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
                    <Icon icon="solar:alt-arrow-down-bold-duotone" className="w-3 h-3 text-zinc-400 group-hover:rotate-180 transition-transform hidden sm:block" />
                </div>
            </div>
        </header>
    );
};
