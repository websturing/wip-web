import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { GLNumber } from '../components/GLNumber';

export default function GLNumberPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'GLNumber', icon: 'solar:widget-3-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="GLNumber"
                subtitle="Management"
                description="Manage and monitor your GLNumber operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <GLNumber />
            </div>
        </div>
    );
}
