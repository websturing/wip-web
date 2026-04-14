'use client';

import { useAcl } from '@/hooks/useAcl';
import React from 'react';

interface PermissionGuardProps {
    permission: string | string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    mode?: 'any' | 'all';
}

export const PermissionGuard = ({
    permission,
    children,
    fallback = null,
    mode = 'any'
}: PermissionGuardProps) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAcl();

    let allowed = false;

    if (Array.isArray(permission)) {
        if (mode === 'any') {
            allowed = hasAnyPermission(permission);
        } else {
            allowed = hasAllPermissions(permission);
        }
    } else {
        allowed = hasPermission(permission);
    }

    if (!allowed) return <>{fallback}</>;

    return <>{children}</>;
};
