import React from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Productivity } from '../components/Productivity';

export default function ProductivityPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'productivity', icon: 'solar:widget-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader 
                items={breadcrumbItems}
                title="productivity"
                subtitle="Management"
                description="Manage and monitor your productivity operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <Productivity />
            </div>
        </div>
    );
}
