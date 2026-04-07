'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';

interface PageHeaderProps {
    items: BreadcrumbItem[];
    title?: string | React.ReactNode;
    subtitle?: string;
    description?: string;
    showTitle?: boolean;
    className?: string;
}

export const PageHeader = ({
    items,
    title,
    subtitle,
    description,
    showTitle = true,
    className
}: PageHeaderProps) => {
    return (
        <div className={cn("animate-in fade-in duration-700", className)}>
            {/* Breadcrumb Part */}
            <Breadcrumb items={items} />

            {/* Title & Description Part */}
            {showTitle && title && (
                <div className="mb-6 md:mb-10  group">
                    <h1 className="text-xl md:text-lg lg:text-[1.5rem] font-bold text-zinc-900 tracking-tight transition-all duration-300">
                        {title} {subtitle && (
                            <span className="text-blue-500 font-extrabold whitespace-nowrap ml-1 group-hover:translate-x-1 inline-block transition-transform">
                                {subtitle}
                            </span>
                        )}
                    </h1>
                    {description && (
                        <p className="text-zinc-500 text-[10px] md:text-xs font-medium   leading-relaxed opacity-80 tracking-[0.2em] max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
