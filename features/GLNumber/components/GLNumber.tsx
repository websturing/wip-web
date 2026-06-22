'use client';

import React from 'react';
import { useGLNumber } from '../hooks/useGLNumber';
import { DataTable, Column } from '@/app/components/ui/DataTable';
import { GlGroup } from '../types';

export const GLNumber = () => {
    const { 
        data, 
        isLoading, 
        page, 
        perPage, 
        total, 
        setPage, 
        setSearch 
    } = useGLNumber();

    const columns: Column<GlGroup>[] = [
        {
            header: 'GL Number',
            accessorKey: 'gl_number',
            sortable: true
        },
        {
            header: 'Customer',
            accessorKey: 'customer_id',
            cell: (item) => item.customer?.name || '-',
            sortable: true
        },
        {
            header: 'Total Lots',
            accessorKey: 'lots',
            cell: (item) => (
                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-bold text-xs">
                    {item.lots?.length || 0} Lots
                </span>
            )
        },
        {
            header: 'Lot List',
            accessorKey: 'lots',
            cell: (item) => (
                <div className="flex flex-wrap gap-1 max-w-[300px]">
                    {item.lots && item.lots.length > 0 ? (
                        item.lots.slice(0, 3).map(lot => (
                            <span key={lot.id} className="bg-zinc-100 text-zinc-600 text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider border border-zinc-200">
                                {lot.lot_number}
                            </span>
                        ))
                    ) : (
                        <span className="text-zinc-400 text-xs italic">-</span>
                    )}
                    {item.lots && item.lots.length > 3 && (
                        <span className="text-zinc-400 text-[10px] px-1 py-0.5">+{item.lots.length - 3} more</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-1">
            <DataTable 
                data={data}
                columns={columns}
                isLoading={isLoading}
                total={total}
                currentPage={page}
                perPage={perPage}
                onPageChange={setPage}
                onSearch={setSearch}
                searchPlaceholder="Search GL Number or Customer..."
            />
        </div>
    );
};
