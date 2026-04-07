'use client';

import { Icon as Iconify, IconProps } from '@iconify/react';

interface Props extends Omit<IconProps, 'icon'> {
    icon: string;
}

export const Icon = ({ icon, className, ...props }: Props) => {
    return <Iconify icon={icon} className={className} {...props} />;
};
