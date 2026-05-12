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
    isCollapsed?: boolean;
    onExpand?: () => void;
}

export const AdminSidebar = ({ isMobile, onClose, isCollapsed, onExpand }: AdminSidebarProps) => {
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
                { id: 'f2-3', name: 'System Colors', path: '/admin/reference/colors', icon: 'solar:palette-linear' },
                { id: 'f2-4', name: 'System Fabrics', path: '/admin/reference/fabric', icon: 'solar:layers-minimalistic-linear' },
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
        {
            id: 'f4', name: 'Industrial Eng.', path: '/admin/ielayout', icon: 'solar:layers-linear',
            children: [
                { id: 'f4-1', name: 'IE Layout', path: '/admin/ielayout', icon: 'solar:map-point-linear' },
                { id: 'f4-2', name: 'Operation List', path: '/admin/operations', icon: 'solar:list-linear' },
                { id: 'f4-3', name: 'Time Study', path: '/admin/time-study', icon: 'solar:stopwatch-linear' },
            ]
        },
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
                title={isCollapsed ? item.name : undefined}
                className={cn(
                    cn("flex items-center rounded-lg transition-all duration-200 cursor-pointer group mb-0.5", isCollapsed ? "justify-center py-2.5 px-0" : "justify-between px-4 py-2.5"),
                    isActive && !isChild ? "bg-theme-secondary text-white shadow-lg shadow-theme-primary/20 backdrop-blur-sm" :
                        isActive && isChild ? "p-2 mx-3 bg-theme-bg-secondary/10 text-theme-text-on-dark" :
                            "text-theme-text-on-dark/60 hover:bg-[var(--theme-glass-hover-bg)] hover:text-theme-text-main hover:mx-1 "
                )}
                onClick={() => {
                    if (isCollapsed && onExpand) {
                        onExpand();
                        if (hasChildren && !isOpen) {
                            toggleMenu(item.name);
                        }
                    } else {
                        hasChildren ? toggleMenu(item.name) : (isMobile && onClose?.());
                    }
                }}
            >
                <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3")}>
                    <Icon
                        icon={item.icon}
                        className={cn(
                            "w-5 h-5",
                            isActive ? "text-theme-text-on-dark" : "text-theme-text-muted group-hover:text-theme-text-main"
                        )}
                    />
                    {!isCollapsed && <span className={cn("text-[13px] capitalize", isActive ? "font-bold" : "font-bold")}>
                        {item.name}
                    </span>}
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        {item.badge && (
                            <span className={cn(
                                "w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold",
                                isActive && !isChild ? "bg-white text-theme-primary" : "bg-theme-primary text-white"
                            )}>
                                {item.badge}
                            </span>
                        )}
                        {hasChildren && (
                            isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />
                        )}
                    </div>
                )}
            </div>
        );

        return (
            <div key={item.id || item.name} className="w-full">
                {hasChildren ? (
                    <div>
                        {content}
                        {!isCollapsed && isOpen && (
                            <div className="relative ml-6 mt-1 mb-2">
                                <div className="absolute left-[2px] top-0 bottom-0 w-[1px] bg-theme-border"></div>
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
        <div className={cn("h-full flex flex-col rounded-xl transition-all duration-300 bg-[#334155]", isCollapsed ? "w-[80px]" : "w-[240px]")}
        >
            {/* Logo & App Name Header */}
            <div className="h-16 flex items-center px-6 border-b border-theme-border shrink-0">
                <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "gap-3")}>
                    <div className="w-8 h-8 rounded-xl bg-theme-secondary    flex items-center justify-center shadow-lg shadow-theme-primary/20">
                        <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        {!isCollapsed && <span className="text-sm font-bold text-theme-text-on-dark leading-tight">
                            {process.env.NEXT_PUBLIC_APP_NAME || 'Antigravity'}
                        </span>}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-5 px-2 no-scrollbar">
                {isLoading ? (
                    <div className="space-y-4 px-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-10 bg-theme-bg-primary rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <nav className="space-y-1">
                        {menuItems.length > 0 ? (
                            menuItems.map(item => renderItem(item))
                        ) : (
                            <div className="px-4 py-8 text-center space-y-2">
                                <Icon icon="solar:shield-warning-linear" className="w-8 h-8 text-theme-text-on-dark mx-auto" />
                                <p className="text-[10px] text-theme-text-on-dark font-bold uppercase tracking-widest leading-tight">
                                    Access not granted<br />
                                    <span className="text-[8px] font-medium lowercase tracking-normal">Please configure menus in backend</span>
                                </p>
                            </div>
                        )}
                    </nav>
                )}
            </div>

            {/* User Profile / Logout */}
            <div className="p-3 border-t border-theme-border mt-auto">
                <div
                    className={cn("cursor-pointer transition-all flex items-center rounded-xl group hover:bg-[var(--theme-glass-hover-bg)]", isCollapsed ? "justify-center p-2 flex-col gap-2" : "justify-between p-3")}
                    style={{ border: 'var(--theme-glass-border)' }}
                    onClick={() => setIsLogoutDialogOpen(true)}
                >
                    <div className={cn("flex items-center overflow-hidden", isCollapsed ? "justify-center" : "gap-3")}>
                        <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-theme-border">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                                alt="avatar"
                                className="w-full h-full"
                            />
                        </div>
                        {!isCollapsed && <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold text-theme-text-on-dark truncate">
                                {user?.email || 'Admin'}
                            </span>
                            <span className="text-[9px] text-theme-text-muted font-medium uppercase tracking-wider">{user?.role?.name || 'Administrator'}</span>
                        </div>}
                    </div>
                    <button
                        className="p-2 shrink-0 text-theme-text-muted group-hover:text-red-400 group-hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
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
