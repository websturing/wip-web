'use client';

import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export const useAcl = () => {
    const { data: session, status } = useSession();
    const user = (session as any)?.user;
    const permissions = user?.role?.permissions || [];
    const isLoading = status === 'loading';

    const hasPermission = useCallback((permissionName: string) => {
        // If user is Administrator, they have all access (optional check)
        if (user?.role?.name === 'Administrator') return true;

        return permissions.some((p: any) => p.name === permissionName);
    }, [user, permissions]);

    const hasAnyPermission = useCallback((permissionNames: string[]) => {
        if (user?.role?.name === 'Administrator') return true;
        return permissionNames.some(name => hasPermission(name));
    }, [user, hasPermission]);

    const hasAllPermissions = useCallback((permissionNames: string[]) => {
        if (user?.role?.name === 'Administrator') return true;
        return permissionNames.every(name => hasPermission(name));
    }, [user, hasPermission]);

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        role: user?.role?.name,
        permissions,
        isLoading
    };
};
