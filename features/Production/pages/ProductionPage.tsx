import { Breadcrumb, BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Production } from '../components/Production';

export default function ProductionPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Sewing', icon: 'solar:t-shirt-bold-duotone' },
        { label: 'Production', icon: 'solar:chart-2-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mb-6 md:mb-8 pt">
                <h1 className="text-lg md:text-xl lg:text-[1.5rem] font-black text-zinc-900 tracking-tight">
                    Production <span className="text-blue-500 font-extrabold whitespace-nowrap">Management</span>
                </h1>
                <p className="text-zinc-500 text-[11px] md:text-xs font-medium mt-1 md:mt-1 leading-relaxed opacity-80 tracking-widest max-w-2xl">
                    Standardized production workflow management for Sewing lines.
                </p>
            </div>

            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                <Production />
            </div>
        </div>
    );
}
