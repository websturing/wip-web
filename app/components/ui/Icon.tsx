'use client';

import { cn } from '@/lib/utils';
import { Icon as IconifyIcon, IconProps as IconifyIconProps } from '@iconify/react';

interface IconProps extends Omit<IconifyIconProps, 'icon'> {
    icon: string;
    className?: string;
}

export const Icon = ({ icon, className, ...props }: IconProps) => {
    return (
        <IconifyIcon
            icon={icon}
            className={cn('w-5 h-5 transition-all', className)}
            {...props}
        />
    );
};
