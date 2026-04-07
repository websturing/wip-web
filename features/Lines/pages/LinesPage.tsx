'use client';

import { PageHeader } from '@/app/components/ui/PageHeader';
import { Lines } from '../components/Lines';

export default function LinesPage() {
    const breadcrumbItems = [
        { label: 'Admin', icon: 'solar:widget-5-bold-duotone', href: '/admin' },
        { label: 'Production Lines', icon: 'solar:tablet-bold-duotone' },
    ];

    return (
        <div className="flex flex-col h-full bg-zinc-50/30">
            <PageHeader
                title="Production Lines"
                breadcrumbItems={breadcrumbItems}
                showTitle={false}
            />
            <div className="flex-1">
                <Lines />
            </div>
        </div>
    );
}
