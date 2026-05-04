'use client';

import { Icon } from '@/app/components/ui/Icon';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useAppName } from '@/hooks/useAppName';
import { useEffect, useState } from 'react';

interface AdminNavbarProps {
    onToggleSidebar?: () => void;
}

export const AdminNavbar = ({ onToggleSidebar }: AdminNavbarProps) => {
    const { user } = useAuth();
    const { prefix } = useAppName();
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
        <header className="h-14 flex items-center justify-between px-4 z-40 bg-white border-b border-zinc-100 transition-all w-full select-none sticky top-0">
            {/* Left: Brand + Toggle */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                    <Icon icon="solar:hamburger-menu-bold-duotone" className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-900 h-8 w-8 rounded-lg flex items-center justify-center shadow-lg shadow-zinc-200">
                        <span className="text-white font-black text-sm italic capitalize">{prefix.charAt(0)}</span>
                    </div>
                    <span className="font-black text-xs uppercase tracking-[0.15em] text-zinc-900 hidden sm:block">
                        {prefix} <span className="text-blue-600">Administrator</span>
                    </span>
                </div>
            </div>

            {/* Center: Clock */}
            <div className="hidden md:flex items-center bg-blue-50/50 border border-blue-100/50 px-4 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2.5"></div>
                <span className="text-[12px] font-black font-mono text-blue-900 tracking-tighter">
                    {dateTime}
                </span>
            </div>

            {/* Right: Actions + User */}
            <div className="flex items-center gap-4">
                {/* Notification */}
                <div className="relative group cursor-pointer p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="h-8 w-px bg-zinc-100 hidden sm:block mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-[12px] font-black text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight">
                            {user?.email?.split('@')[0] || 'Administrator'}
                        </span>
                        <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-1 rounded uppercase tracking-widest leading-none py-0.5">
                            Admin
                        </span>
                    </div>
                    <div className="relative h-9 w-9 rounded-full ring-2 ring-transparent group-hover:ring-blue-100 transition-all p-0.5 overflow-hidden shadow-sm">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                            alt="avatar"
                            className="w-full h-full rounded-full bg-slate-50"
                        />
                    </div>
                    <Icon
                        icon="solar:alt-arrow-down-bold-duotone"
                        className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 group-hover:rotate-180 transition-all hidden xs:block"
                    />
                </div>
            </div>
        </header>
    );
};
