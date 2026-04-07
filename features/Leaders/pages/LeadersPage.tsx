import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Leaders } from '../components/Leaders';

export default function LeadersPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Leaders', icon: 'solar:widget-3-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Leaders"
                subtitle="Management"
                description="Manage and monitor your Leaders operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <Leaders />
            </div>
        </div>
    );
}
