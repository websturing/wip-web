'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Icon } from '@/app/components/ui/Icon';
import { Button } from '@/app/components/ui/Button';
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
            cell: (item) => (
                <Link href={`/admin/laying-planning/${item.id}`} className="text-blue-600 font-bold hover:underline">
                    {item.lot_code || item.lot?.lot_code || '-'}
                </Link>
            )
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
        },
        {
            header: 'Set Item & Parts',
            accessorKey: 'is_set_item',
            cell: (item) => {
                if (!item.is_set_item) {
                    return (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide bg-zinc-100 text-zinc-600">
                            No
                        </span>
                    );
                }

                return (
                    <div className="flex flex-col gap-1.5 items-start">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide bg-indigo-50 text-indigo-700">
                            Yes ({item.parts?.length || 0} Parts)
                        </span>
                    </div>
                );
            }
        },
        {
            header: '',
            accessorKey: 'action',
            cell: (item) => (
                <Button 
                    onClick={() => router.push(`/admin/laying-planning/${item.id}`)}
                    variant="ghost" 
                    className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-blue-100/50"
                >
                    Detail
                </Button>
            )
        }
    ];

    const renderExpandedRow = (item: any) => {
        return (
            <div className="p-6 bg-zinc-50/80 border-l-[3px] border-l-blue-500 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-8">
                    {/* Parts Setup Section */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-200 pb-2 mb-3">Parts Setup</h4>
                        {item.is_set_item && item.parts && item.parts.length > 0 ? (
                            <ul className="space-y-2 list-disc pl-4 text-xs font-medium text-zinc-600">
                                {item.parts.map((p: any) => (
                                    <li key={p.id}>
                                        <span className="text-zinc-900 font-bold">{p.item_part}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-zinc-400 italic">No parts configuration available.</p>
                        )}
                    </div>

                    {/* Additional Information / Sizes Section */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-200 pb-2 mb-3">Sizes Allocated</h4>
                        {item.size_details && item.size_details.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {item.size_details.map((sz: any) => (
                                    <div key={sz.id} className="px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-600">
                                        {sz.size?.size || sz.size?.size_code || sz.size?.name || 'Unknown'}: <span className="text-blue-600">{sz.order_qty} pcs</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-zinc-400 italic">No sizes allocated.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

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
                renderExpandedRow={renderExpandedRow}
            />
        </div>
    );
};
