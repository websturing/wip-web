'use client';

import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    className?: string;
    cell?: (item: T, index: number) => React.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select'; // New: flexible filter type
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    searchPlaceholder?: string;
    title?: string;
    onRowClick?: (item: T) => void;
}

export const DataTable = <T extends { [key: string]: any }>({
    data = [],
    columns,
    isLoading = false,
    searchPlaceholder = "Search records...",
    onRowClick
}: DataTableProps<T>) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: '', direction: null });
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    // Filtering & Searching Logic
    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Search Query
            const matchesSearch = Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Column Filters
            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                return String(item[key] || '').toLowerCase() === value.toLowerCase() ||
                    String(item[key] || '').toLowerCase().includes(value.toLowerCase());
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, searchQuery, filters]);

    // Sorting Logic
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;

        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // New: Helper to get unique options for select filter
    const getUniqueOptions = (key: string) => {
        const values = data.map(item => item[key]).filter(val => val !== null && val !== undefined && val !== '');
        return Array.from(new Set(values)).sort();
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-6 md:p-8 border-b border-zinc-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-600">
                        <Icon icon="solar:filter-bold-duotone" className="w-5 h-5" />
                    </div>
                    <div className="relative group flex-1 min-w-[300px]">
                        <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full bg-zinc-50 border border-zinc-100 h-12 rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    {columns.filter(col => col.filterable).map((col, idx) => {
                        const accessorKey = col.accessorKey as string;
                        if (col.filterType === 'select') {
                            const options = getUniqueOptions(accessorKey);
                            return (
                                <div key={idx} className="flex-shrink-0 relative group">
                                    <select
                                        className="appearance-none bg-zinc-50 border border-zinc-100 h-10 rounded-lg pl-3 pr-8 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-w-[140px] cursor-pointer"
                                        value={filters[accessorKey] || ''}
                                        onChange={(e) => handleFilterChange(accessorKey, e.target.value)}
                                    >
                                        <option value="">All {col.header}s</option>
                                        {options.map((opt, idx) => (
                                            <option key={idx} value={String(opt)}>{String(opt)}</option>
                                        ))}
                                    </select>
                                    <Icon icon="solar:alt-arrow-down-bold" className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className="flex-shrink-0 relative group">
                                <input
                                    type="text"
                                    placeholder={`Filter ${col.header}...`}
                                    className="bg-zinc-50 border border-zinc-100 h-10 rounded-lg px-3 py-1 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-w-[120px]"
                                    value={filters[accessorKey] || ''}
                                    onChange={(e) => handleFilterChange(accessorKey, e.target.value)}
                                />
                                {filters[accessorKey] && (
                                    <button
                                        onClick={() => handleFilterChange(accessorKey, '')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600"
                                    >
                                        <Icon icon="solar:close-circle-bold" className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {Object.values(filters).some(v => v) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 text-[10px] uppercase font-black tracking-widest px-3 h-10"
                            onClick={() => setFilters({})}
                        >
                            Reset Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50/50">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 select-none",
                                        col.sortable && "cursor-pointer hover:text-zinc-900 transition-colors",
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.header}
                                        {col.sortable && (
                                            <div className="flex flex-col opacity-30">
                                                <Icon
                                                    icon="solar:alt-arrow-up-bold"
                                                    className={cn("w-2 h-2", sortConfig.key === col.accessorKey && sortConfig.direction === 'asc' && "text-blue-600 opacity-100")}
                                                />
                                                <Icon
                                                    icon="solar:alt-arrow-down-bold"
                                                    className={cn("w-2 h-2 -mt-1", sortConfig.key === col.accessorKey && sortConfig.direction === 'desc' && "text-blue-600 opacity-100")}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="py-20 text-center">
                                    <div className="inline-block w-6 h-6 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                </td>
                            </tr>
                        ) : sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-32 text-center text-zinc-400">
                                    <Icon icon="solar:box-minimalistic-linear" className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-sm font-medium">No results match your criteria.</p>
                                    {(searchQuery || Object.values(filters).some(v => v)) && (
                                        <button
                                            onClick={() => { setSearchQuery(''); setFilters({}); }}
                                            className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-2 hover:underline"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item, rowIdx) => (
                                <tr
                                    key={rowIdx}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "group transition-all duration-300",
                                        onRowClick ? "cursor-pointer hover:bg-zinc-50/50" : "hover:bg-zinc-50/30"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={cn("px-8 py-6 text-zinc-600 text-sm font-medium", col.className)}>
                                            {col.cell ? col.cell(item, rowIdx) : item[col.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination / Summary Footer */}
            <div className="p-6 bg-zinc-50/30 border-t border-zinc-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Showing <span className="text-zinc-900">{sortedData.length}</span> of <span className="text-zinc-900">{data.length}</span> entries
                </span>

                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-100">
                        <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 font-black text-xs border border-zinc-100 shadow-sm">
                        1
                    </div>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-100">
                        <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
