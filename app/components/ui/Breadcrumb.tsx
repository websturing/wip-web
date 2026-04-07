'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icon } from './Icon';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: string;
}

interface BreadcrumbProps {
    items?: BreadcrumbItem[]; // Optional
    className?: string;
}

export const Breadcrumb = ({ items = [], className }: BreadcrumbProps) => {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex mb-2 md:mb-4", className)}>
            <ol className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap scroll-smooth py-1 no-scrollbar lg:space-x-2">
                {items && items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <Icon
                                    icon="solar:alt-arrow-right-linear"
                                    className="w-3 md:w-3.5 h-3 md:h-3.5 text-zinc-300 mx-0.5 md:mx-1 shrink-0"
                                />
                            )}

                            <div className="flex items-center">
                                {item.href && !isLast ? (
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs text-zinc-400 hover:text-blue-500 transition-colors uppercase tracking-widest leading-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md py-0.5 px-0.5"
                                    >
                                        {item.icon && <Icon icon={item.icon} className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1" />}
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={cn(
                                        "flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs uppercase tracking-widest leading-none",
                                        isLast ? "text-blue-600" : "text-zinc-400"
                                    )}>
                                        {item.icon && <Icon icon={item.icon} className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1 shrink-0" />}
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
