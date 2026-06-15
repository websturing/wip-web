'use client';

import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { Icon } from '@/app/components/ui/Icon';
import { useHeader } from '@/app/contexts/HeaderContext';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useAppName } from '@/hooks/useAppName';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AdminNavbarProps {
    onToggleSidebar?: () => void;
    isScrolled?: boolean;
}

export const AdminNavbar = ({ onToggleSidebar, isScrolled = false }: AdminNavbarProps) => {
    const { user } = useAuth();
    const { prefix } = useAppName();
    const [dateTime, setDateTime] = useState('');
    const { headerState } = useHeader();
    const { title, subtitle, breadcrumbItems } = headerState;
    const hasHeader = !!title || (breadcrumbItems && breadcrumbItems.length > 0);

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
        <div className={cn(
            "h-14 flex items-center justify-between px-4 z-40 transition-all duration-500 rounded-lg",
            isScrolled
                ? "bg-white/90 backdrop-blur-xl shadow-xl shadow-black/10 text-zinc-900"
                : "bg-white text-zinc-900"
        )}>
            {/* Left: Brand + Toggle */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button
                    onClick={onToggleSidebar}
                    className={cn(
                        "lg:hidden p-2 -ml-2 rounded-xl transition-colors shrink-0",
                        isScrolled ? "text-zinc-400 hover:bg-white/10" : "text-zinc-600 hover:bg-zinc-100"
                    )}
                >
                    <Icon icon="solar:hamburger-menu-bold-duotone" className="w-6 h-6" />
                </button>

                {hasHeader ? (
                    <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {breadcrumbItems && breadcrumbItems.length > 0 && (
                            <Breadcrumb items={breadcrumbItems} className="!mb-0 hidden lg:flex border-r border-zinc-200 pr-3 mr-1" />
                        )}
                        {title && (
                            <h1 className="text-[13px] md:text-[14px] font-black uppercase tracking-wide truncate text-zinc-900">
                                {title}
                                {subtitle && <span className="ml-1.5 text-theme-primary">{subtitle}</span>}
                            </h1>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-500">
                        <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shadow-lg transition-colors bg-black shadow-black/20",
                        )}>
                            <span className="text-white font-black text-sm italic capitalize">{prefix.charAt(0)}</span>
                        </div>
                        <span className={cn(
                            "font-black text-xs uppercase tracking-[0.15em] hidden sm:block transition-colors text-zinc-900",
                        )}>
                            {prefix} Administrator
                        </span>
                    </div>
                )}
            </div>

            {/* Center: Clock */}
            <div className={cn(
                "hidden md:flex items-center px-4 py-1.5 rounded-full border transition-colors bg-blue-50/50 border-blue-100/50",
            )}>
                <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse mr-2.5 bg-theme-primary"
                )}></div>
                <span className={cn(
                    "text-[12px] font-black font-mono tracking-tighter transition-colors text-blue-900",
                )}>
                    {dateTime}
                </span>
            </div>

            {/* Right: Actions + User */}
            <div className="flex items-center gap-4">
                {/* Notification */}
                <div className={cn(
                    "relative group cursor-pointer p-2 rounded-xl transition-all text-zinc-400 hover:text-theme-primary hover:bg-blue-50"
                )}>
                    <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-transparent rounded-full"></div>
                </div>

                <div className={cn(
                    "h-8 w-px hidden sm:block mx-1 transition-colors",
                )}></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className={cn(
                            "text-[12px] font-black transition-colors tracking-tight text-zinc-900 group-hover:text-theme-primary"
                        )}>
                            {user?.email}
                        </span>
                        <span className="text-[9px] font-black text-orange-500 bg-orange-50/10 px-1 rounded uppercase tracking-widest leading-none py-0.5">
                            Admin
                        </span>
                    </div>
                    <div className={cn(
                        "relative h-9 w-9 rounded-full ring-2 transition-all p-0.5 overflow-hidden shadow-sm",
                        isScrolled ? "ring-transparent group-hover:ring-white/20" : "ring-transparent group-hover:ring-blue-100"
                    )}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                            alt="avatar"
                            className="w-full h-full rounded-full bg-slate-50"
                        />
                    </div>
                    <Icon
                        icon="solar:alt-arrow-down-bold-duotone"
                        className={cn(
                            "w-3.5 h-3.5 group-hover:rotate-180 transition-all hidden xs:block",
                            isScrolled ? "text-zinc-400 group-hover:text-white" : "text-zinc-400 group-hover:text-theme-primary"
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
