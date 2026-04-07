import { Breadcrumb, BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { GLNumber } from '../components/GLNumber';

export default function GLNumberPage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'GLNumber', icon: 'solar:widget-3-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mb-6 md:mb-10 pt-2">
                <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold text-zinc-900 tracking-tight lowercase">
                    GLNumber <span className="text-blue-500 font-extrabold whitespace-nowrap">Management</span>
                </h1>
                <p className="text-zinc-500 text-[10px] md:text-xs font-medium mt-1 md:mt-2 leading-relaxed opacity-80 uppercase tracking-widest">
                    Manage and monitor your GLNumber operations efficiently.
                </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <GLNumber />
            </div>
        </div>
    );
}
