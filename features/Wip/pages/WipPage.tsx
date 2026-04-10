import React from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Wip } from '../components/Wip';

export default function WipPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Wip', icon: 'solar:widget-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader 
                items={breadcrumbItems}
                title="Wip"
                subtitle="Management"
                description="Manage and monitor your Wip operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <Wip />
            </div>
        </div>
    );
}
