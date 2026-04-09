'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IeLayoutDailyManpowerDialog } from './components/IeLayoutDailyManpowerDialog';
import { IeLayoutList } from './components/IeLayoutList';
import { useIeLayout } from './hooks/useIeLayout';

export const IeLayoutPage = () => {
    const router = useRouter();
    const { refresh } = useIeLayout();
    const [isManpowerDialogOpen, setIsManpowerDialogOpen] = useState(false);
    const [selectedLayoutForManpower, setSelectedLayoutForManpower] = useState<any>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Engineering', icon: 'solar:programming-bold-duotone' },
        { label: 'IE Layouts', icon: 'solar:layers-bold-duotone' },
    ];

    const handleCreate = () => {
        router.push('/admin/ielayout/create');
    };

    const handleEdit = (layout: any) => {
        router.push(`/admin/ielayout/edit/${layout.id}`);
    };

    const handleManpowerClick = (layout: any) => {
        setSelectedLayoutForManpower(layout);
        setIsManpowerDialogOpen(true);
    };

    const handleSuccess = () => {
        refresh();
    };

    return (
        <div className="animate-in fade-in duration-1000">
            <PageHeader
                items={breadcrumbItems}
                title="Industrial Engineering"
                subtitle="Layout Management"
                description="Optimize production flows with digitalized time studies and balanced cell architectures."
            />

            {/* Dashboard Controls */}
            <div className="px-10 py-8 bg-white border-b border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 p-4 rounded-2xl text-white shadow-xl shadow-zinc-200">
                        <Icon icon="solar:programming-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase leading-none mb-1">Architecture Feed</h2>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                            Real-time production sequence data
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-14 bg-zinc-50 rounded-2xl p-1.5 flex items-center gap-1.5 shadow-inner border border-zinc-100">
                        <button className="h-full px-6 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-zinc-900 border border-zinc-200/50">ACTIVE MODULES</button>
                        <button className="h-full px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors">ARCHIVED</button>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="h-14 px-10 bg-zinc-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-zinc-200 transition-all active:scale-95 flex items-center gap-3 group"
                    >
                        <Icon icon="solar:add-circle-bold-duotone" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                        <span>Create Layout</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-zinc-50/50 min-h-[50vh] pb-24 no-scrollbar">
                <IeLayoutList onEdit={handleEdit} onManpowerClick={handleManpowerClick} />
            </div>

            <IeLayoutDailyManpowerDialog
                open={isManpowerDialogOpen}
                onOpenChange={setIsManpowerDialogOpen}
                layout={selectedLayoutForManpower}
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
