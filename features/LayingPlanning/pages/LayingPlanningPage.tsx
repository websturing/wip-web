'use client';

import { PermissionGuard } from '@/app/components/auth/PermissionGuard';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { useRouter } from 'next/navigation';
import { LayingPlanning } from '../components/LayingPlanning';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';

export default function LayingPlanningPage() {
    const router = useRouter();
    const breadcrumbItems = useBreadcrumb();

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="LayingPlanning"
                subtitle="Management"
                description="Manage and monitor your LayingPlanning operations efficiently."
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden">
                <PermissionGuard permission="laying_planning.create">
                    <Button
                        onClick={() => router.push('/admin/laying-planning/create')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-10 flex items-center gap-2 transition-all shadow-md active:scale-95 text-xs font-bold"
                    >
                        <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                        <span>New Entry</span>
                    </Button>
                </PermissionGuard>
                <LayingPlanning />
            </div>
        </div>
    );
}
