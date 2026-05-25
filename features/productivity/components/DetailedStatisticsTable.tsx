import React, { useState } from 'react';
import { Icon } from '@/app/components/ui/Icon';

interface DetailedStatisticsTableProps {
    data: any[];
    isLoading: boolean;
}

export default function DetailedStatisticsTable({ data, isLoading }: DetailedStatisticsTableProps) {
    const [entries, setEntries] = useState(10);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'days_running', direction: 'desc' });
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (gl: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(gl)) next.delete(gl);
            else next.add(gl);
            return next;
        });
    };
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const isCurrentlyRunning = (lastUpdateStr: string) => {
        if (!lastUpdateStr) return false;
        const lastUpdate = new Date(lastUpdateStr);
        const today = new Date();
        const diffTime = today.getTime() - lastUpdate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    };

    const filteredData = data.filter(item =>
        (item.gl_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.color || '').toLowerCase().includes(search.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / entries);
    const paginatedData = sortedData.slice((currentPage - 1) * entries, currentPage * entries);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
                <h2 className="text-sm font-black text-zinc-900 tracking-tight">Summary Statistic</h2>
            </div>

            <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500">Show</span>
                    <select
                        value={entries}
                        onChange={(e) => { setEntries(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-xs font-bold text-zinc-500">entries</span>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none w-64 focus:border-zinc-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead>
                        <tr className="bg-zinc-100 border-y border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            <th className="w-10 px-2"></th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('gl_number')}>GL NUMBER {getSortIcon('gl_number')}</th>

                            <th className="px-4 py-3 text-right cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('order_qty')}>ORDER QTY {getSortIcon('order_qty')}</th>
                            <th className="px-4 py-3 text-right cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('output_qty')}>OUTPUT QTY {getSortIcon('output_qty')}</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('balance')}>BALANCE {getSortIcon('balance')}</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('days_running')}>DAYS RUNNING {getSortIcon('days_running')}</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('achievement')}>ACHIEVEMENT {getSortIcon('achievement')}</th>
                            <th className="px-4 py-3 text-center cursor-pointer hover:bg-zinc-200/50" onClick={() => handleSort('last_update')}>LAST UPDATE {getSortIcon('last_update')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">Loading data...</td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">No records found</td>
                            </tr>
                        ) : (
                            paginatedData.map((item, idx) => {
                                const running = isCurrentlyRunning(item.last_update);
                                const isExpanded = expandedRows.has(item.gl_number);
                                return (
                                    <React.Fragment key={idx}>
                                        <tr className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-zinc-50/50' : ''}`} onClick={() => toggleRow(item.gl_number)}>
                                            <td className="px-4 py-3 text-center">
                                                {item.colors && item.colors.length > 0 && (
                                                    <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
                                                        <Icon icon={isExpanded ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-right-bold"} className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-zinc-900">
                                                <div className="flex items-center gap-2">
                                                    {item.gl_number}
                                                    {item.is_set_item && (
                                                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold tracking-widest uppercase" title="Output dihitung berdasarkan set terkecil (Minimum antara Top dan Pants)">
                                                            SET ITEM
                                                        </span>
                                                    )}
                                                    {running && (
                                                        <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold tracking-widest uppercase" title="Output logged within last 7 days">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            ACTIVE
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right">{new Intl.NumberFormat('en-US').format(item.order_qty)}</td>
                                            <td className="px-4 py-3 font-bold text-right" title={item.is_set_item ? "Calculated based on completed sets (Min of Top & Pants)" : undefined}>{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`font-bold ${item.balance > 0 ? 'text-emerald-500' : item.balance < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                                                    {item.balance > 0 ? `+${new Intl.NumberFormat('en-US').format(item.balance)}` : new Intl.NumberFormat('en-US').format(item.balance)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-zinc-600">{item.days_running}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded border text-[10px] font-black ${item.achievement >= 80
                                                        ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                                                        : item.achievement >= 50
                                                            ? 'border-amber-200 text-amber-600 bg-amber-50'
                                                            : 'border-red-200 text-red-600 bg-red-50'
                                                    }`}>
                                                    {item.achievement.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-zinc-500">{item.last_update}</td>
                                        </tr>
                                        {isExpanded && item.colors && item.colors.length > 0 && (
                                            <tr>
                                                <td colSpan={8} className="bg-zinc-50/50 p-4 border-b border-zinc-100">
                                                    <div className="pl-12 pr-4 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-black text-zinc-900 mb-1">Color Breakdown</h4>
                                                                <p className="text-[10px] text-zinc-500">Summary of Input & Output per color for {item.gl_number}</p>
                                                            </div>
                                                            <a href={`/admin/detailed-statistics/${encodeURIComponent(item.gl_number)}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-md hover:scale-105 active:scale-95 transition-all">
                                                                <Icon icon="solar:chart-square-bold-duotone" className="w-4 h-4" />
                                                                View Detailed Size Breakdown
                                                            </a>
                                                        </div>

                                                        {item.is_set_item && item.color_parts && Object.keys(item.color_parts).length > 0 && (
                                                            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 my-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4 text-blue-500" />
                                                                    <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-800">Set Item Breakdown</h5>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    {Object.entries(item.color_parts).map(([baseName, parts]: [string, any], idx) => {
                                                                        if (!parts.has_set) return null;
                                                                        const combinedInput = Math.min(parts.top_input, parts.pant_input);
                                                                        const combinedOutput = Math.min(parts.top_output, parts.pant_output);
                                                                        return (
                                                                            <div key={idx} className="bg-white border border-blue-100/50 rounded-md p-2 shadow-sm text-[10px]">
                                                                                <div className="font-bold text-blue-900 mb-1">{baseName}</div>
                                                                                <div className="flex justify-between items-center text-zinc-600">
                                                                                    <span>TOP: <span className="font-bold text-zinc-900">{parts.top_output}</span> / <span className="font-medium text-zinc-500">{parts.top_input}</span></span>
                                                                                    <span>PANTS: <span className="font-bold text-zinc-900">{parts.pant_output}</span> / <span className="font-medium text-zinc-500">{parts.pant_input}</span></span>
                                                                                    <span className="font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">COMBINED: {combinedOutput}</span>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <table className="w-full text-left text-[11px] border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                            <thead className="bg-zinc-100/80 text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                                                                <tr>
                                                                    <th className="px-4 py-2">COLOR / TYPE</th>
                                                                    <th className="px-4 py-2 text-right">INPUT</th>
                                                                    <th className="px-4 py-2 text-right">OUTPUT</th>
                                                                    <th className="px-4 py-2 text-center">BALANCE</th>
                                                                    <th className="px-4 py-2 text-center">ACHIEVEMENT</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-zinc-100">
                                                                {item.colors.map((c: any, cIdx: number) => (
                                                                    <tr key={cIdx} className="hover:bg-zinc-50/50">
                                                                        <td className="px-4 py-2 font-medium text-zinc-700">{c.color || '-'}</td>
                                                                        <td className="px-4 py-2 text-right">{new Intl.NumberFormat('en-US').format(c.order_qty)}</td>
                                                                        <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(c.output_qty)}</td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={`font-bold ${c.balance > 0 ? 'text-emerald-500' : c.balance < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                                                                                {c.balance > 0 ? `+${new Intl.NumberFormat('en-US').format(c.balance)}` : new Intl.NumberFormat('en-US').format(c.balance)}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            <span className={`font-bold ${c.achievement >= 80 ? 'text-emerald-600' : c.achievement >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                                {c.achievement.toFixed(2)}%
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot className="bg-zinc-100/50">
                                                                <tr>
                                                                    <td className="px-4 py-2 font-bold text-zinc-900 text-right">TOTAL</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(item.order_qty)}</td>
                                                                    <td className="px-4 py-2 text-right font-bold text-zinc-900">{new Intl.NumberFormat('en-US').format(item.output_qty)}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={`font-bold ${item.balance > 0 ? 'text-emerald-500' : item.balance < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                                                                            {item.balance > 0 ? `+${new Intl.NumberFormat('en-US').format(item.balance)}` : new Intl.NumberFormat('en-US').format(item.balance)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center font-bold text-zinc-900">
                                                                        {item.achievement.toFixed(2)}%
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-zinc-500 font-medium">
                    Showing {(currentPage - 1) * entries + 1} to {Math.min(currentPage * entries, filteredData.length)} of {filteredData.length} entries
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-zinc-200 rounded text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {getPageNumbers().map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 border rounded text-xs font-bold transition-all ${currentPage === page
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1.5 border border-zinc-200 rounded text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
