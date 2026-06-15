'use client';

import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { useHeader } from '@/app/contexts/HeaderContext';
import { Icon } from './Icon';

interface PageHeaderProps {
    items?: BreadcrumbItem[]; // Optional now
    breadcrumbItems?: BreadcrumbItem[]; // New prop
    title?: string | React.ReactNode;
    subtitle?: string;
    description?: string;
    showTitle?: boolean;
    className?: string;
    action?: React.ReactNode;
}

export const PageHeader = ({
    items,
    breadcrumbItems,
    title,
    subtitle,
    description,
    showTitle = true,
    className,
    action
}: PageHeaderProps) => {
    // Merge or fallback
    const finalItems = breadcrumbItems || items || [];
    const { setHeaderState } = useHeader();

    useEffect(() => {
        setHeaderState({
            title: showTitle ? title : undefined,
            subtitle: showTitle ? subtitle : undefined,
            breadcrumbItems: finalItems.length > 0 ? finalItems : undefined,
        });

        // Cleanup when page unmounts
        return () => {
            setHeaderState({});
        };
    }, [title, subtitle, JSON.stringify(finalItems), showTitle, setHeaderState]);

    if (!description && !action) return null;

    return (
        <div className={cn("animate-in fade-in duration-700", className)}>
            {/* Title & Description Part */}
            <div className="mb-4 group flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {description && (
                        <div className="flex items-start gap-2.5 bg-theme-bg-primary/50 text-theme-text-main p-3 rounded-xl border border-zinc-100/50 w-fit shadow-sm">
                            <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-theme-secondary mt-0.5" />
                            <p className="text-[11px] md:text-xs font-medium leading-relaxed opacity-80 max-w-3xl">
                                {description}
                            </p>
                        </div>
                    )}
                </div>
                {action && (
                    <div className="flex shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

