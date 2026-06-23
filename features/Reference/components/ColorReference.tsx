'use client';

import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Icon } from '@/app/components/ui/Icon';
import { useMemo } from 'react';
import { useReferenceColors } from '../hooks/useReferenceColors';

export const ColorReference = () => {
    const { colors, isLoading, currentPage, total, perPage, setPage, setSearch } = useReferenceColors();

    const processedData = useMemo(() => {
        return colors.map(color => {
            return {
                ...color,
                display_gl: color.gl_group?.gl_number || 'Global',
            };
        });
    }, [colors]);

    const columns: Column<any>[] = [
        {
            header: '#',
            accessorKey: 'index',
            className: 'w-10 text-zinc-400 font-bold',
            cell: (_, idx) => idx + 1
        },
        {
            header: 'System Color',
            accessorKey: 'standard_name',
            filterable: true,
            sortable: true,
            cell: (item) => (
                <div>
                    <p className="font-bold text-zinc-900 leading-none">{item.standard_name}</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-tighter">
                        Code: {item.code || '-'}
                    </p>
                </div>
            )
        },
        {
            header: 'GL Group',
            accessorKey: 'display_gl',
            filterable: true,
            sortable: true,
            cell: (item) => (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-mono text-[11px] font-bold border border-blue-100">
                    {item.display_gl}
                </span>
            )
        },
        {
            header: 'Aliases',
            accessorKey: 'aliases',
            cell: (item) => (
                <div className="flex flex-wrap gap-1">
                    {item.aliases && item.aliases.length > 0 ? (
                        item.aliases.map((alias: any) => (
                            <span key={alias.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold border border-zinc-200">
                                <span>{alias.alias_name}</span>
                                {alias.department && (
                                    <span className="px-1.5 py-0.5 bg-zinc-200/50 text-zinc-500 rounded-[4px] text-[8px] uppercase tracking-wider">
                                        {alias.department}
                                    </span>
                                )}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] font-medium text-zinc-400 italic">No aliases</span>
                    )}
                </div>
            )
        },
        {
            header: 'Last Update',
            accessorKey: 'updated_at',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-zinc-900 text-xs font-bold leading-none">
                        {new Date(item.updated_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-zinc-400 text-[10px] font-medium mt-1 uppercase">
                        {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 p-3 rounded-2xl text-white shadow-xl shadow-zinc-200">
                        <Icon icon="solar:palette-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">System Master Colors</h2>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] opacity-60 mt-1">Color Reference Data</p>
                    </div>
                </div>
            </div>

            <DataTable
                data={processedData}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search colors..."
                total={total}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setPage}
                onSearch={setSearch}
            />
        </div>
    );
};
