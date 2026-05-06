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
import { MenuItem, MenuService } from '@/features/Acl/services/MenuService';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface AdminSidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export const AdminSidebar = ({ isMobile, onClose }: AdminSidebarProps) => {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>(['Production']);

    // --- API-Driven Menu Fetching ---
    const { data: apiMenuItems = [], isLoading } = useQuery({
        queryKey: ['sidebar-menus'],
        queryFn: () => MenuService.getSidebarMenus(),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    // --- Fallback Menu for Administrator (If API fails or is empty) ---
    const fallbackMenus: MenuItem[] = useMemo(() => [
        { id: 'f1', name: 'Dashboard', path: '/admin', icon: 'solar:home-2-linear' },
        {
            id: 'f2', name: 'Master Data', path: '/admin/master', icon: 'solar:database-linear',
            children: [
                { id: 'f2-1', name: 'Garment Reference', path: '/admin/reference', icon: 'solar:reorder-linear' },
                { id: 'f2-2', name: 'Media Library', path: '/admin/media', icon: 'solar:gallery-linear' },
            ]
        },
        {
            id: 'f3', name: 'Production', path: '/admin/production-group', icon: 'solar:settings-linear',
            children: [
                { id: 'f3-1', name: 'Output', path: '/admin/production', icon: 'solar:chart-2-linear' },
                { id: 'f3-2', name: 'Lines', path: '/admin/lines', icon: 'solar:tablet-linear' },
                { id: 'f3-3', name: 'Productivity', path: '/admin/productivity', icon: 'solar:graph-up-linear' },
            ]
        },
        { id: 'f4', name: 'Industrial Eng.', path: '/admin/ielayout', icon: 'solar:layers-linear' },
        { id: 'f5', name: 'Access Control', path: '/admin/acl', icon: 'solar:shield-check-linear' },
    ], []);

    // Combine API data with fallback if needed
    const menuItems = useMemo(() => {
        if (apiMenuItems.length > 0) return apiMenuItems;

        // Flexible Admin Check (Case-insensitive)
        const isAdmin = user?.role?.name?.toLowerCase().includes('admin');

        if (!isLoading && isAdmin) return fallbackMenus;
        return [];
    }, [apiMenuItems, isLoading, user, fallbackMenus]);

    useEffect(() => {
        const findAndOpenParent = (items: MenuItem[]) => {
            items.forEach(item => {
                if (item.children?.some(child => pathname.startsWith(child.path))) {
                    if (!openMenus.includes(item.name)) {
                        setOpenMenus(prev => [...prev, item.name]);
                    }
                }
                if (item.children) findAndOpenParent(item.children);
            });
        };
        findAndOpenParent(menuItems);
    }, [pathname, menuItems]);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev =>
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    const renderItem = (item: MenuItem, isChild = false) => {
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
                            isActive ? "text-white" : "text-zinc-300 group-hover:text-white"
                        )}
                    />
                    <span className={cn("text-[13px] capitalize", isActive ? "font-bold" : "font-semibold")}>
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
            <div key={item.id || item.name} className="w-full">
                {hasChildren ? (
                    <div>
                        {content}
                        {isOpen && (
                            <div className="relative ml-6 mt-1 mb-2">
                                <div className="absolute left-[2px] top-0 bottom-0 w-[1px] bg-zinc-600"></div>
                                <div className="space-y-1   ">
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
        <div className="w-[260px] h-full bg-[#111827] flex flex-col rounded-lg border-r border-white/5 transition-all duration-300">
            <div className="flex-1 overflow-y-auto pt-5 px-2 no-scrollbar">
                {isLoading ? (
                    <div className="space-y-4 px-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <nav className="space-y-1">
                        {menuItems.length > 0 ? (
                            menuItems.map(item => renderItem(item))
                        ) : (
                            <div className="px-4 py-8 text-center space-y-2">
                                <Icon icon="solar:shield-warning-linear" className="w-8 h-8 text-zinc-600 mx-auto" />
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-tight">
                                    Access not granted<br />
                                    <span className="text-[8px] font-medium lowercase tracking-normal">Please configure menus in backend</span>
                                </p>
                            </div>
                        )}
                    </nav>
                )}
            </div>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/5">
                <div className="cursor-pointer hover:bg-red-500/60 transition-all flex items-center justify-between bg-red-700 p-3 rounded-2xl border border-white/5 shadow-sm" onClick={() => setIsLogoutDialogOpen(true)}>
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
                                {user?.email || 'Admin'}
                            </span>
                            <span className="text-[9px] text-zinc-300 font-medium uppercase tracking-wider">{user?.role?.name || 'Administrator'}</span>
                        </div>
                    </div>
                    <button

                        className="p-2 text-zinc-300 hover:text-white hover:bg-red-900/30 rounded-xl transition-all cursor-pointer"
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
