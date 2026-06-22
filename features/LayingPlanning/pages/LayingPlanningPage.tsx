import React from 'react';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { LayingPlanning } from '../components/LayingPlanning';

export default function LayingPlanningPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'LayingPlanning', icon: 'solar:widget-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader 
                items={breadcrumbItems}
                title="LayingPlanning"
                subtitle="Management"
                description="Manage and monitor your LayingPlanning operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <LayingPlanning />
            </div>
        </div>
    );
}
