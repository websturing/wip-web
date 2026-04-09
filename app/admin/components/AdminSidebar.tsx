'use client';

import { Button } from '@/app/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';


interface AdminSidebarProps {
    isMobile?: boolean; // Prop to handle mobile view specifics
    onClose?: () => void;
}

export const AdminSidebar = ({ isMobile, onClose }: AdminSidebarProps) => {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const sections = [
        {
            items: [
                { name: 'Dashboard', path: '/admin', icon: 'solar:widget-5-bold-duotone', badge: null }
            ]
        },
        {
            title: 'Master Data',
            items: [
                { name: 'Garment Reference', path: '/admin/reference', icon: 'solar:database-bold-duotone', badge: null }
            ]
        },
        {
            title: 'Sewing - Production',
            items: [
                { name: 'Production Output', path: '/admin/production', icon: 'solar:chart-2-bold-duotone', badge: null },
                { name: 'Lines', path: '/admin/lines', icon: 'solar:tablet-bold-duotone', badge: null },
                { name: 'Productivity', path: '/admin/productivity', icon: 'solar:tablet-bold-duotone', badge: null }
            ],
            badgeSection: '404'
        },

        {
            title: 'Industrial Engineering',
            items: [
                { name: 'Leaders', path: '/admin/leaders', icon: 'solar:user-rounded-bold-duotone', badge: null },
            ],
            badgeSection: '404'
        }
    ];


    return (
        <div className="w-[260px] lg:w-[280px] h-full bg-[#111827] rounded-[0.8rem] flex flex-col shadow-2xl relative overflow-hidden transition-all duration-300">
            {/* Header Area with Close for Mobile */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1 rounded font-black text-[10px] text-white">GL</div>
                    <span className="text-white font-black text-xs uppercase tracking-widest italic">WIP Administrator</span>
                </div>
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="p-1 px-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="12" /></svg>
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pt-6 pb-6 no-scrollbar scroll-smooth">
                <nav className="space-y-0.5">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-4">
                            {section.title && (
                                <div className="px-4 py-1 flex items-center justify-between group cursor-default">
                                    <span className="text-[11px] font-black text-zinc-500 uppercase  leading-none transition-colors group-hover:text-zinc-500">
                                        {section.title}
                                    </span>
                                    {section.badgeSection && (
                                        <span className="bg-red-500/10 text-red-500 px-1 py-0.5 rounded-[4px] text-[8px] font-black tracking-tighter">
                                            {section.badgeSection}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="">
                                {section.items.map((item, iIdx) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={iIdx}
                                            href={item.path}
                                            onClick={() => isMobile && onClose?.()}
                                            className={cn(
                                                "relative flex items-center justify-between pl-6 pr-4 py-3 transition-all group",
                                                isActive
                                                    ? 'bg-zinc-800/50 text-orange-400 font-bold'
                                                    : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    icon={item.icon}
                                                    className={cn(
                                                        "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                                                        isActive ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-300'
                                                    )}
                                                />
                                                <span className="text-[12px] tracking-tight font-medium">{item.name}</span>
                                            </div>

                                            {item.badge && (
                                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-[4px] text-[8px] font-black">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {isActive && (
                                                <div className="absolute right-0 top-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-in fade-in slide-in-from-right-1 duration-500"></div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogContent className="max-w-[340px]">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-center">Confirm Logout</DialogTitle>
                        <DialogDescription className="text-center mt-2">
                            Are you sure you want to log out? <br /> Any unsaved changes might be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 mt-6">
                        <Button variant="ghost" size="sm" onClick={() => setIsLogoutDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => logout()}>
                            Yes, Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="h-16 flex items-center justify-center gap-3 bg-[#111827] text-zinc-500 hover:text-red-400 transition-all font-black text-[12px] uppercase tracking-widest border-t border-zinc-800/50 cursor-pointer w-full group"
            >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Logout</span>
            </button>
        </div>
    );
};
