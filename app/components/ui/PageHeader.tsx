'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

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

    return (
        <div className={cn("animate-in fade-in duration-700", className)}>
            {/* Breadcrumb Part */}
            <Breadcrumb items={finalItems} />

            {/* Title & Description Part */}
            {showTitle && title && (
                <div className="mb-6 md:mb-10 group flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-lg lg:text-[1.5rem] uppercase font-black text-zinc-900 transition-all duration-300">
                            {title} {subtitle && (
                                <span className="text-blue-500 font-extrabold whitespace-nowrap ml-1 group-hover:translate-x-1 inline-block transition-transform">
                                    {subtitle}
                                </span>
                            )}
                        </h1>
                        {description && (
                            <p className="text-zinc-500 text-[10px] md:text-sm font-medium leading-relaxed opacity-80 max-w-3xl">
                                {description}
                            </p>
                        )}
                    </div>
                    {action && (
                        <div className="flex shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

