import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Production } from '../components/Production';

export default function ProductionPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Sewing', icon: 'solar:t-shirt-bold-duotone' },
        { label: 'Production', icon: 'solar:chart-2-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Production"
                subtitle="Management"
                description="Standardized production workflow management for Sewing lines."
            />

            <div className="bg-white  overflow-hidden">
                <Production />
            </div>
        </div>
    );
}
