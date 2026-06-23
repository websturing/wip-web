'use client';

import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Icon } from '@/app/components/ui/Icon';
import React, { useMemo } from 'react';
import { useReferenceFabric } from '../hooks/useReferenceFabric';

export const FabricReference = () => {
    const { fabrics, isLoading, currentPage, total, perPage, setPage, setSearch } = useReferenceFabric();

    const processedData = useMemo(() => {
        return fabrics.map(fabric => {
            return {
                ...fabric,
                display_gl: fabric.gl_group?.gl_number || 'Global',
            };
        });
    }, [fabrics]);

    const columns: Column<any>[] = [
        {
            header: '#',
            accessorKey: 'index',
            className: 'w-10 text-zinc-400 font-bold',
            cell: (_, idx) => idx + 1
        },
        {
            header: 'Fabric Content',
            accessorKey: 'standard_content',
            filterable: true,
            sortable: true,
            cell: (item) => (
                <span className="font-bold text-zinc-900">{item.standard_content}</span>
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
                                <span>{alias.alias_content}</span>
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
                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">System Master Fabrics</h2>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] opacity-60 mt-1">Fabric Reference Data</p>
                    </div>
                </div>
            </div>

            <DataTable
                data={processedData}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search fabrics..."
                total={total}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setPage}
                onSearch={setSearch}
            />
        </div>
    );
};
