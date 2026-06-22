'use client';

import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MenuService } from '@/features/Acl/services/MenuService';

export const useBreadcrumb = (customOverrides: Record<string, { label: string, icon?: string }> = {}) => {
    const pathname = usePathname();
    
    // Fetch menus (usually cached by react-query since sidebar also fetches it)
    const { data: menus = [] } = useQuery({
        queryKey: ['acl', 'sidebar-menus'],
        queryFn: () => MenuService.getSidebarMenus(),
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    const segments = pathname.split('/').filter(Boolean);
    
    const breadcrumbs: any[] = [];
    
    if (segments[0] === 'admin') {
        breadcrumbs.push({ label: 'Home', href: '/admin', icon: 'solar:home-2-bold-duotone' });
    }

    let currentPath = '';

    const findMenuByPath = (path: string, menuList: any[]): any => {
        for (const menu of menuList) {
            // Sometimes menu.path in db might be just `/laying-planning` instead of `/admin/laying-planning`
            // Let's check both exact match and suffix match
            if (menu.path === path || `/admin${menu.path}` === path || menu.path === `/admin${path}`) return menu;
            if (menu.children && menu.children.length > 0) {
                const found = findMenuByPath(path, menu.children);
                if (found) return found;
            }
        }
        return null;
    };

    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Skip 'admin' since it's "Home"
        if (index === 0 && segment === 'admin') return;

        // Check explicit overrides (highest priority)
        if (customOverrides[currentPath]) {
            breadcrumbs.push({
                label: customOverrides[currentPath].label,
                href: currentPath,
                icon: customOverrides[currentPath].icon || 'solar:alt-arrow-right-bold-duotone'
            });
            return;
        }
        
        if (customOverrides[segment]) {
            breadcrumbs.push({
                label: customOverrides[segment].label,
                href: currentPath,
                icon: customOverrides[segment].icon || 'solar:alt-arrow-right-bold-duotone'
            });
            return;
        }

        // Check against database menus
        const menuMatch = findMenuByPath(currentPath, menus);
        
        if (menuMatch) {
            breadcrumbs.push({
                label: menuMatch.name,
                href: currentPath,
                icon: menuMatch.icon || 'solar:widget-bold-duotone'
            });
        } else {
            // Auto formatting fallback
            const label = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
            let defaultIcon = 'solar:alt-arrow-right-bold-duotone';
            
            if (segment === 'create' || segment === 'new') defaultIcon = 'solar:add-circle-bold-duotone';
            else if (segment === 'edit') defaultIcon = 'solar:pen-bold-duotone';

            breadcrumbs.push({
                label: label,
                href: currentPath,
                icon: defaultIcon
            });
        }
    });

    return breadcrumbs;
};
