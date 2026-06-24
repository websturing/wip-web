'use client';

import { useRouter } from 'next/navigation';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Icon } from '@/app/components/ui/Icon';
import { useLayingPlanning } from '../hooks/useLayingPlanning';

export const LayingPlanning = () => {
    const router = useRouter();
    const { data, isLoading, total, currentPage, perPage, setPage } = useLayingPlanning();

    const columns: Column<any>[] = [
        {
            header: 'GL Number',
            accessorKey: 'lot_code',
            sortable: true,
            filterable: true,
            cell: (item) => item.lot_code || item.lot?.lot_code || '-'
        },
        {
            header: 'Color',
            accessorKey: 'color_name',
            sortable: true,
            filterable: true,
            cell: (item) => item.color_name || item.color?.name || item.color?.code || '-'
        },
        {
            header: 'Type',
            accessorKey: 'planning_type',
            sortable: true,
            filterable: true,
            filterType: 'select',
            cell: (item) => (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold tracking-wide">
                    {item.planning_type || item.laying_planning_type?.name || '-'}
                </span>
            )
        },
        {
            header: 'Fabric',
            accessorKey: 'fabric_content',
            sortable: true,
            cell: (item) => item.fabric_content || item.fabric?.content || item.fabric?.standard_content || '-'
        },
        {
            header: 'Plan Date',
            accessorKey: 'plan_date',
            sortable: true,
        },
        {
            header: 'Created At',
            accessorKey: 'created_at',
            sortable: true,
            cell: (item) => {
                if (!item.created_at) return '-';
                const date = new Date(item.created_at);
                const day = date.getDate();
                const month = date.toLocaleDateString('id-ID', { month: 'long' });
                const year = date.getFullYear();
                const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
                return <span className="text-zinc-600">{`${day} ${month} ${year} ${time}`}</span>;
            }
        },
        {
            header: 'Total Sizes',
            accessorKey: 'size_details',
            cell: (item) => {
                const sizes = item.size_details || [];
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{sizes.length} Sizes</span>
                    </div>
                );
            }
        },
        {
            header: 'Combine',
            accessorKey: 'is_combine',
            cell: (item) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${item.is_combine ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>
                    {item.is_combine ? 'Yes' : 'No'}
                </span>
            )
        }
    ];

    return (
        <div className="p-8 bg-white rounded-2xl border border-zinc-100 transition-all">
            <div className="flex items-center gap-4 mb-6 text-[#111827]">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Icon icon="solar:bolt-bold-duotone" className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Laying Planning Data</h2>
                    <p className="text-zinc-500 text-xs font-medium">Manage and view laying planning records</p>
                </div>
            </div>

            <DataTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search planning records..."
                total={total}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setPage}
                onRowClick={(item) => router.push(`/admin/laying-planning/${item.id}`)}
            />
        </div>
    );
};
