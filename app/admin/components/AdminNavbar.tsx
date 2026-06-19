'use client';

import { ThemeToggle } from '@/app/admin/components/ThemeToggle';
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
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export const AdminNavbar = ({ onToggleSidebar, isScrolled = false, isCollapsed, onToggleCollapse }: AdminNavbarProps) => {
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
            "h-14 flex items-center justify-between px-4 z-40 transition-all duration-500 rounded-xl",
            isScrolled ? "shadow-lg" : ""
        )}
            style={{
                background: isScrolled ? 'var(--theme-glass-scrolled-bg)' : 'var(--theme-glass-scrolled-bg)',
                backdropFilter: `blur(var(--theme-glass-blur)) saturate(var(--theme-glass-saturate))`,
                WebkitBackdropFilter: `blur(var(--theme-glass-blur)) saturate(var(--theme-glass-saturate))`,
                boxShadow: isScrolled ? 'var(--theme-glass-shadow)' : 'none',
                border: 'var(--theme-glass-border)',
            }}
        >
            {/* Left: Brand + Toggle */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button
                    onClick={onToggleSidebar}
                    className={cn(
                        "lg:hidden p-2 -ml-2 rounded-xl transition-colors shrink-0",
                        isScrolled ? "text-theme-text-muted hover:bg-theme-bg-primary" : "text-theme-text-muted hover:bg-theme-bg-primary"
                    )}
                >
                    <Icon icon="solar:hamburger-menu-bold-duotone" className="w-6 h-6" />
                </button>

                <button
                    onClick={onToggleCollapse}
                    className={cn(
                        "hidden lg:flex p-2 -ml-2 rounded-xl transition-colors shrink-0",
                        isScrolled ? "text-theme-text-muted hover:bg-theme-bg-primary" : "text-theme-text-muted hover:bg-[var(--theme-glass-hover-bg)]"
                    )}
                >
                    <Icon icon={isCollapsed ? "solar:sidebar-minimalistic-outline" : "solar:sidebar-minimalistic-bold-duotone"} className="w-6 h-6" />
                </button>


                {hasHeader ? (
                    <div className="flex items-center gap-3 whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {breadcrumbItems && breadcrumbItems.length > 0 && (
                            <Breadcrumb items={breadcrumbItems} className="!mb-0 hidden lg:flex border-r border-theme-border pr-3 mr-1" />
                        )}
                        {title && (
                            <h1 className="text-[13px] md:text-[14px] font-black uppercase tracking-wide truncate text-theme-text-main">
                                {title}
                                {subtitle && <span className="ml-1.5 text-theme-primary">{subtitle}</span>}
                            </h1>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-500">
                        <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shadow-lg transition-colors bg-theme-primary shadow-theme-primary/20",
                        )}>
                            <span className="text-white font-black text-sm italic capitalize">{prefix.charAt(0)}</span>
                        </div>
                        <span className={cn(
                            "font-black text-xs uppercase tracking-[0.15em] hidden sm:block transition-colors text-theme-text-main",
                        )}>
                            {prefix} Administrator
                        </span>
                    </div>
                )}
            </div>



            {/* Right: Actions + User */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notification */}
                <div className={cn(
                    "relative group cursor-pointer p-2 rounded-xl transition-all text-theme-text-muted hover:text-theme-primary hover:bg-theme-secondary/10"
                )}>
                    <Icon icon="solar:bell-bing-bold-duotone" className="w-5 h-5" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-transparent rounded-full"></div>
                </div>

                <div className={cn(
                    "h-8 w-px hidden sm:block mx-1 transition-colors bg-theme-border",
                )}></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className={cn(
                            "text-[12px] font-black transition-colors tracking-tight text-theme-text-main group-hover:text-theme-primary"
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
                            isScrolled ? "text-theme-text-muted group-hover:text-theme-text-main" : "text-theme-text-muted group-hover:text-theme-primary"
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
