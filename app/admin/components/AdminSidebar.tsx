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
import { useAppName } from '@/hooks/useAppName';
import { cn } from '@/lib/utils';
import { LogOut, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SidebarItem {
    name: string;
    path: string;
    icon: string;
    badge?: string | number | null;
    children?: SidebarItem[];
}

interface AdminSidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export const AdminSidebar = ({ isMobile, onClose }: AdminSidebarProps) => {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { prefix } = useAppName();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const sections: SidebarItem[] = [
        { name: 'Home', path: '/admin', icon: 'solar:home-2-linear' },
        { name: 'Messages', path: '/admin/messages', icon: 'solar:letter-linear', badge: 2 },
        {
            name: 'Master Data',
            path: '/admin/master',
            icon: 'solar:database-linear',
            children: [
                { name: 'Garment Reference', path: '/admin/reference', icon: 'solar:reorder-linear' },
                { name: 'Media Library', path: '/admin/media', icon: 'solar:gallery-linear' },
            ]
        },
        {
            name: 'Sewing Production',
            path: '/admin/production-group',
            icon: 'solar:settings-linear',
            children: [
                { name: 'Production Output', path: '/admin/production', icon: 'solar:chart-2-linear' },
                { name: 'Lines', path: '/admin/lines', icon: 'solar:tablet-linear' },
                { name: 'Productivity', path: '/admin/productivity', icon: 'solar:graph-up-linear' },
            ]
        },
        {
            name: 'Logistics',
            path: '/admin/logistics',
            icon: 'solar:box-linear',
            children: [
                { name: 'Packing Feed', path: '/admin/packing', icon: 'solar:box-linear' },
                { name: 'WIP Dashboard', path: '/admin/wip', icon: 'solar:pie-chart-linear' },
            ]
        },
        { name: 'Industrial Engineering', path: '/admin/ielayout', icon: 'solar:layers-linear' },
        { name: 'Access Control', path: '/admin/acl', icon: 'solar:shield-check-linear' },
        { name: 'Contacts', path: '/admin/contacts', icon: 'solar:user-id-linear' },
        { name: 'Explore', path: '/admin/explore', icon: 'solar:globus-linear' },
    ];

    useEffect(() => {
        sections.forEach(item => {
            if (item.children?.some(child => pathname.startsWith(child.path))) {
                if (!openMenus.includes(item.name)) {
                    setOpenMenus(prev => [...prev, item.name]);
                }
            }
        });
    }, [pathname]);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const renderItem = (item: SidebarItem, isChild = false) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.name);
        const isActive = item.path === '/admin'
            ? pathname === item.path
            : pathname.startsWith(item.path);

        const content = (
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 cursor-pointer group mb-1",
                    isActive && !isChild ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" :
                        isActive && isChild ? "bg-white/10 text-white shadow-sm" :
                            "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => hasChildren ? toggleMenu(item.name) : (isMobile && onClose?.())}
            >
                <div className="flex items-center gap-3">
                    <Icon
                        icon={item.icon}
                        className={cn(
                            "w-5 h-5",
                            isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                        )}
                    />
                    <span className={cn("text-[13px] font-medium tracking-tight", isActive ? "font-bold" : "")}>
                        {item.name}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {item.badge && (
                        <span className={cn(
                            "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold",
                            isActive && !isChild ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                        )}>
                            {item.badge}
                        </span>
                    )}
                    {hasChildren && (
                        isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />
                    )}
                </div>
            </div>
        );

        return (
            <div key={item.name} className="w-full">
                {hasChildren ? (
                    <div>
                        {content}
                        {isOpen && (
                            <div className="relative ml-6 mt-1 mb-2">
                                <div className="absolute left-[9px] top-0 bottom-0 w-[1.5px] bg-zinc-800"></div>
                                <div className="space-y-1 pl-4">
                                    {item.children?.map(child => renderItem(child, true))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href={item.path} onClick={() => isMobile && onClose?.()}>
                        {content}
                    </Link>
                )}
            </div>
        );
    };

    return (
        <div className="w-[260px] h-full bg-[#111827] flex flex-col border-r border-white/5 transition-all duration-300">
            {/* Header */}
            <div className="px-6 pt-8 pb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                        <Icon icon="solar:stars-minimalistic-bold" className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Menu</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
                <nav className="space-y-1">
                    {sections.map(section => renderItem(section))}
                </nav>
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden border border-white/10">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                                alt="avatar"
                                className="w-full h-full"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white truncate max-w-[100px]">
                                {user?.email?.split('@')[0] || 'Admin'}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">Administrator</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsLogoutDialogOpen(true)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogContent className="max-w-[340px] bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <Icon icon="solar:danger-triangle-bold-duotone" className="w-6 h-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-center font-bold text-white">Sign Out</DialogTitle>
                        <DialogDescription className="text-center mt-2 text-zinc-400">
                            Are you sure you want to end your current session?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 mt-6">
                        <Button variant="ghost" className="rounded-xl px-6 text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setIsLogoutDialogOpen(false)}>
                            Stay
                        </Button>
                        <Button variant="danger" className="rounded-xl px-6" onClick={() => logout()}>
                            Sign Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
