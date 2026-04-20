'use client';

import { PermissionGuard } from '@/app/components/auth/PermissionGuard';
import { Button } from '@/app/components/ui/Button';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { DatePicker } from '@/app/components/ui/DatePicker';
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle
} from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useProduction } from '../hooks/useProduction';
import { ProductionService } from '../services/ProductionService';

export const Production = () => {
    const router = useRouter();
    const [viewDate, setViewDate] = useState(new Date(Date.now() - 86400000).toISOString().split('T')[0]);
    const { data: productions, isLoading, refresh } = useProduction({ date: viewDate });

    // Filters
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
    const [filterLine, setFilterLine] = useState<string>('ALL');
    const [filterGL, setFilterGL] = useState<string>('ALL');
    const [filterLot, setFilterLot] = useState<string>('ALL');

    const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);

    // Helper to format GL Number (Remove leading zeros + suffix -00 if missing)
    const formatGL = useCallback((gl: string) => {
        if (!gl || gl === 'ALL') return gl;
        const clean = gl.replace(/^0+/, '');
        return clean.includes('-') ? clean : `${clean}`;
    }, []);

    // Extract Filter Options from current data
    const filterOptions = useMemo(() => {
        const lines = new Set<string>();
        const gls = new Set<string>();
        const lots = new Set<string>();

        productions?.forEach(p => {
            if (p.line?.name) lines.add(p.line.name);
            p.items?.forEach((item: any) => {
                if (item.lot?.gl_group?.gl_number) gls.add(item.lot.gl_group.gl_number);
                if (item.lot?.lot_code) lots.add(item.lot.lot_code);
            });
        });

        return {
            lines: ['ALL', ...Array.from(lines).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))],
            gls: ['ALL', ...Array.from(gls).sort((a, b) => formatGL(a).localeCompare(formatGL(b), undefined, { numeric: true, sensitivity: 'base' }))],
            lots: ['ALL', ...Array.from(lots).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))]
        };
    }, [productions, formatGL]);

    // Apply filters and group by GL + Lot
    const groupedData = useMemo(() => {
        if (!productions) return {};

        const groups: Record<string, any> = {};

        productions.forEach((p: any) => {
            const lineName = p.line?.name || 'Unknown Line';

            // Apply Line Filter
            if (filterLine !== 'ALL' && lineName !== filterLine) return;

            if (!groups[lineName]) {
                groups[lineName] = {
                    lineName,
                    total_in: 0,
                    total_out: 0,
                    entries: []
                };
            }

            p.items?.forEach((item: any) => {
                const glNoRaw = item.lot?.gl_group?.gl_number || 'Unknown GL';
                const lotCode = item.lot?.lot_code || 'Unknown Lot';
                const lotClean = item.lot?.lot_number?.replace(/^0+/, '') || '0';

                // Apply GL/Lot Filters
                if (filterGL !== 'ALL' && glNoRaw !== filterGL) return;
                if (filterLot !== 'ALL' && lotCode !== filterLot) return;

                const glNo = formatGL(glNoRaw);
                const entry = {
                    ...p,
                    glNo,
                    lotCode,
                    lotClean,
                    customerName: item.lot?.gl_group?.customer?.name || 'Unknown Buyer',
                    styleNo: item.lot?.style_no || 'Unknown Style',
                    qty_in: item.details.reduce((sum: number, d: any) => sum + d.qty_input, 0),
                    qty_out: item.details.reduce((sum: number, d: any) => sum + d.qty_output, 0),
                    color: item.color,
                    item_details: item.details
                };

                groups[lineName].total_in += entry.qty_in;
                groups[lineName].total_out += entry.qty_out;
                groups[lineName].entries.push(entry);
            });
        });

        // Sort keys numerically (A1, A2, A10)
        const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        const sortedGroups: Record<string, any> = {};
        sortedKeys.forEach(k => {
            sortedGroups[k] = groups[k];
        });

        return sortedGroups;
    }, [productions, filterLine, filterGL, filterLot, formatGL]);

    const toggleCard = (key: string) => {
        if (viewMode === 'cards') {
            setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
        } else {
            setSelectedGroupKey(key === selectedGroupKey ? null : key);
        }
    };

    // Need expandedCards back for Card View
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; loading: boolean }>({
        open: false,
        id: null,
        loading: false
    });

    const handleDelete = async () => {
        if (!confirmDelete.id) return;

        setConfirmDelete(prev => ({ ...prev, loading: true }));
        try {
            const result = await ProductionService.delete(confirmDelete.id);
            if (result.status === 'success' || result.message?.toLowerCase().includes('success')) {
                setConfirmDelete({ open: false, id: null, loading: false });
                refresh();
            } else {
                alert(`Failed to delete: ${result.message || 'Unknown error'}`);
                setConfirmDelete(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('An error occurred while deleting the record.');
            setConfirmDelete(prev => ({ ...prev, loading: false }));
        }
    };

    if (isLoading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filtering Report...</span>
        </div>
    );

    return (
        <>
            <div className="p-2  mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-12">
                    <div className="flex items-start gap-5">
                        <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                            <Icon icon="solar:filters-bold-duotone" className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Production Feed</h2>
                            <div className="flex items-start gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Showing previous day's production by default</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-start gap-3 bg-white p-3 rounded-[2rem] border border-zinc-100 shadow-sm">
                        <DatePicker
                            value={viewDate}
                            onChange={(val) => setViewDate(val)}
                            className="w-[200px]"
                        />

                        <div className="w-30">
                            <Select
                                options={filterOptions.lines.map(l => ({ id: l, label: l === 'ALL' ? 'All Lines' : l, value: l }))}
                                value={filterLine}
                                onChange={(val) => setFilterLine(String(val))}
                                placeholder="Select Line"
                            />
                        </div>

                        <div className="w-35">
                            <Select
                                options={filterOptions.gls.map(g => ({ id: g, label: g === 'ALL' ? 'All GLs' : formatGL(g), value: g }))}
                                value={filterGL}
                                onChange={(val) => setFilterGL(String(val))}
                                placeholder="Select GL"
                            />
                        </div>

                        <div className="h-10 bg-zinc-100 rounded-2xl p-1 flex items-center gap-1 shadow-inner border border-zinc-200">
                            <button
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    "h-full px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    viewMode === 'table' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:list-bold-duotone" className="w-4 h-4" />
                                <span>Table</span>
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={cn(
                                    "h-full px-4 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    viewMode === 'cards' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:widget-bold-duotone" className="w-4 h-4" />
                                <span>Cards</span>
                            </button>
                        </div>

                        <PermissionGuard permission="production.create">
                            <Button
                                onClick={() => router.push('/admin/production/create')}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-10 flex items-center gap-2 transition-all shadow-md active:scale-95 text-xs font-bold"
                            >
                                <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                                <span>New Entry</span>
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Production Display */}
                <div className="w-full">
                    {Object.keys(groupedData).length === 0 ? (
                        <div className="py-32 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                            <Icon icon="solar:ghost-bold-duotone" className="w-12 h-12 opacity-10 mb-6" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">No data matching filters</p>
                        </div>
                    ) : viewMode === 'cards' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {Object.entries(groupedData).map(([key, data]: [string, any]) => (
                                <div key={key} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl h-fit">
                                    {/* Card Header (GL + Lot) */}
                                    <button
                                        onClick={() => toggleCard(key)}
                                        className="w-full p-6 flex flex-col bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors group relative border-b border-zinc-100"
                                    >
                                        <div className="flex items-center justify-between w-full mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <span className="text-[10px] font-black leading-none mb-0.5">LINE</span>
                                                    <span className="text-sm font-black leading-none">{data.lineName}</span>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Production Center</h3>
                                                    <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">Daily Feed Overview</p>
                                                </div>
                                            </div>
                                            <div className={cn("p-2 rounded-xl bg-white border border-zinc-200 transition-transform duration-500 shadow-sm", expandedCards[key] && "rotate-180")}>
                                                <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3 text-zinc-400" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm gap-2">
                                            <div className="flex flex-col items-start border-r border-zinc-100 pr-4 flex-1">
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total In</span>
                                                <span className="text-sm font-black text-zinc-900">{data.total_in}</span>
                                            </div>
                                            <div className="flex flex-col items-end pl-4 flex-1">
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 text-right">Total Out</span>
                                                <span className="text-sm font-black text-blue-600">{data.total_out}</span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Entries List inside Card */}
                                    {expandedCards[key] && (
                                        <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500 bg-white">
                                            <div className="px-2 mb-2">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{data.entries.length} ACTIVITY LOGS</span>
                                            </div>
                                            {data.entries.map((p: any, pIdx: number) => (
                                                <div key={pIdx} className="bg-zinc-50/50 rounded-2xl border border-zinc-100 p-4 hover:border-blue-200 transition-all group/entry">
                                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-zinc-900 px-2.5 py-1 rounded-md text-[9px] font-black text-white">
                                                                {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div className="flex flex-col leading-none">
                                                                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-tight">{p.customerName}</span>
                                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{p.styleNo}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-1">
                                                                <span className="bg-zinc-800 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">GL {p.glNo}</span>
                                                                <span className="bg-zinc-100 text-zinc-500 text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-200">LOT {p.lotClean}</span>
                                                            </div>
                                                            <div className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                                                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.color}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex justify-between mb-1.5">
                                                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Line IN</span>
                                                                <span className="text-[11px] font-black text-zinc-900">{p.qty_in}</span>
                                                            </div>
                                                            <div className="h-1 bg-zinc-200/50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-zinc-900/20 w-full"></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between mb-1.5">
                                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Done OUT</span>
                                                                <span className="text-[11px] font-black text-blue-600">{p.qty_out}</span>
                                                            </div>
                                                            <div className="h-1 bg-blue-100/50 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500/30 w-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in duration-700">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Production Line</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Buyer</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none w-48">GL Log</th>
                                        <th className="px-4 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Total Qty</th>
                                        <th className="px-4 py-4 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {Object.entries(groupedData).map(([key, data]: [string, any]) => {
                                        const uniqueBuyers = Array.from(new Set(data.entries.map((e: any) => e.customerName)));
                                        const uniqueGlLots = Array.from(new Set(data.entries.map((e: any) => `${e.glNo}|${e.lotClean}`)));
                                        const isExpanded = expandedRows[key];

                                        return (
                                            <Fragment key={key}>
                                                <tr
                                                    onClick={() => setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    className={cn(
                                                        "hover:bg-zinc-50/50 transition-all cursor-pointer border-b border-zinc-50",
                                                        isExpanded && "bg-zinc-50/80 shadow-inner"
                                                    )}
                                                >
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-20 h-10 rounded-xl flex flex-col items-center justify-center border border-zinc-200 transition-all",
                                                                isExpanded ? "bg-zinc-900 scale-105 text-white" : "bg-zinc-100 text-zinc-900"
                                                            )}>
                                                                <span className="text-[8px] font-black leading-none mb-0.5">LINE</span>
                                                                <span className="text-sm font-black leading-none">{data.lineName}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex flex-wrap gap-2">
                                                                {uniqueBuyers.map((buyer, i) => (
                                                                    <span key={i} className="text-zinc-900 font-black text-[11px] uppercase whitespace-nowrap">
                                                                        {buyer}{i < uniqueBuyers.length - 1 ? ',' : ''}
                                                                    </span>
                                                                ))}


                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-wrap gap-2">
                                                            <div className="flex items-center justify-between gap-1.5  bg-zinc-100 text-zinc-900  font-black px-2 py-1 rounded border border-zinc-200">
                                                                {uniqueGlLots.slice(0, 1).map((glLot: any, i: number) => {
                                                                    const [gl, lot] = glLot.split('|');
                                                                    return (
                                                                        <span key={i} className="uppercase tracking-widest text-[11px]">
                                                                            {gl}<span className="text-blue-600 ">-0{lot}</span>
                                                                        </span>
                                                                    );
                                                                })}
                                                                {uniqueGlLots.length > 1 && (
                                                                    <span className="ml-2 w-15 bg-zinc-900 text-white text-[9px] font-black px-2 py-1 rounded shadow-sm ">
                                                                        +{uniqueGlLots.length - 1} More
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5 text-right min-w-[140px]">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Day Input</span>
                                                                <span className="text-sm font-black text-zinc-900">{data.total_in}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black text-teal-600 uppercase tracking-tighter">Day Output</span>
                                                                <span className="text-lg font-black text-teal-600 tracking-tight leading-none">{data.total_out}</span>
                                                            </div>


                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-5 text-center flex gap-1.5">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 transition-all",
                                                            isExpanded && "rotate-180 bg-zinc-900 text-white"
                                                        )}>
                                                            <Icon icon="solar:alt-arrow-down-bold" className="w-4 h-4" />
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedGroupKey(key)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all "
                                                        >
                                                            <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
                                                            <span>Full View</span>
                                                        </button>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="bg-zinc-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <td colSpan={5} className="p-0">
                                                            <div className="p-8 pb-12 border-x-2 border-b-2 border-white rounded-b-[2rem] shadow-inner space-y-6">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-2">Detailed Activity Log Breakdown</h4>
                                                                    <div className="flex items-center gap-4">
                                                                        <button
                                                                            onClick={() => setSelectedGroupKey(key)}
                                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                                                                        >
                                                                            <Icon icon="solar:eye-bold-duotone" className="w-4 h-4" />
                                                                            <span>Full View</span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                                    {data.entries.map((p: any, pIdx: number) => (
                                                                        <div key={pIdx} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm group/card hover:border-blue-200 transition-all">
                                                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-50">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="bg-zinc-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black">
                                                                                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                    </div>
                                                                                    <div className="flex flex-col leading-none">
                                                                                        <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">{p.customerName}</span>
                                                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-0.5">{p.styleNo}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center justify-between gap-4 mb-4">
                                                                                <div className="flex flex-col gap-1.5 flex-1">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <span className="bg-zinc-100 text-zinc-900 text-[8px] font-black px-1.5 py-0.5 rounded border border-zinc-200">GL {p.glNo}</span>
                                                                                        <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-100">LOT {p.lotClean}</span>
                                                                                    </div>
                                                                                    <div className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{p.color}</div>
                                                                                </div>
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="text-[9px] font-black text-blue-400 uppercase leading-none mb-1">Output</span>
                                                                                    <span className="text-lg font-black text-blue-600 leading-none">{p.qty_out}</span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-50">
                                                                                <PermissionGuard permission="production.update">
                                                                                    <button onClick={() => router.push(`/admin/production/edit/${p.id}`)} className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                                                                                        <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </PermissionGuard>
                                                                                <PermissionGuard permission="production.delete">
                                                                                    <button onClick={() => setConfirmDelete({ open: true, id: p.id, loading: false })} className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                                                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                                                                    </button>
                                                                                </PermissionGuard>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Side Drawer using Local Dialog (Radix) */}
                <Dialog open={!!selectedGroupKey} onOpenChange={(open) => !open && setSelectedGroupKey(null)}>
                    <DialogPortal>
                        <DialogOverlay className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
                        <DialogContent className="w-full max-w-2xl min-h-[50vh] max-h-[90vh] bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden outline-none border-none">
                            {selectedGroupKey && groupedData[selectedGroupKey] && (
                                <>
                                    <div className="p-10 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between flex-shrink-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl">
                                                <span className="text-[10px] font-black leading-none mb-1">LINE</span>
                                                <span className="text-xl font-black leading-none">{groupedData[selectedGroupKey].lineName}</span>
                                            </div>
                                            <div>
                                                <DialogTitle className="text-2xl font-black text-zinc-900 uppercase tracking-tight">
                                                    Production Details
                                                </DialogTitle>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mt-1">ACTIVITY LOGS SUMMARY</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedGroupKey(null)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 hover:bg-zinc-900 hover:text-white flex items-center justify-center text-zinc-400 transition-all shadow-sm active:scale-95 outline-none"
                                        >
                                            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto  p-10 space-y-4 font-sans hover-scrollbar">
                                        {groupedData[selectedGroupKey].entries.map((p: any, pIdx: number) => (
                                            <div key={pIdx} className="bg-zinc-50/50 rounded-3xl border border-zinc-100 p-6 hover:border-blue-100 transition-colors">
                                                <div className="flex flex-col gap-6 mb-6 pb-6 border-b border-zinc-100">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black">
                                                                {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-col mb-1.5">
                                                                    <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight leading-tight">{p.customerName}</span>
                                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{p.styleNo}</span>
                                                                </div>

                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black bg-zinc-900 text-white px-1.5 py-0.5 rounded shadow-sm">GL {p.glNo}</span>
                                                                <span className="text-[9px] font-black bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">LOT {p.lotClean}</span>
                                                                {p.remarks && (
                                                                    <span className="text-[9px] font-bold text-orange-500 italic truncate max-w-[150px]">"{p.remarks}"</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <PermissionGuard permission="production.update">
                                                                    <button
                                                                        onClick={() => router.push(`/admin/production/edit/${p.id}`)}
                                                                        className="w-8 h-8 rounded-lg bg-white border border-zinc-100 hover:bg-zinc-900 hover:text-white flex items-center justify-center text-zinc-400 transition-all shadow-sm active:scale-95"
                                                                        title="Edit Log"
                                                                    >
                                                                        <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                                    </button>
                                                                </PermissionGuard>
                                                                <PermissionGuard permission="production.delete">
                                                                    <button
                                                                        onClick={() => setConfirmDelete({ open: true, id: p.id, loading: false })}
                                                                        className="w-8 h-8 rounded-lg bg-white border border-zinc-100 hover:bg-red-500 hover:text-white flex items-center justify-center text-zinc-400 transition-all shadow-sm active:scale-95 group/del"
                                                                        title="Delete Log"
                                                                    >
                                                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4 group-hover/del:scale-110" />
                                                                    </button>
                                                                </PermissionGuard>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="px-4 py-1.5 bg-blue-50 border border-blue-100 rounded">
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.color}</span>
                                                    </div>
                                                    {/* Size Breakdown */}
                                                    <div className="space-y-3">
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block px-1">Size Breakdown (PK)</span>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            {p.item_details?.map((d: any, dIdx: number) => (
                                                                <div key={dIdx} className="bg-white border border-zinc-100 p-3 rounded-2xl flex flex-col items-center shadow-sm">
                                                                    <span className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1">{d.size_name}</span>
                                                                    <span className="text-sm font-black text-blue-600 leading-none">{d.qty_output}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 leading-none">Input Yield</span>
                                                        <span className="text-lg font-black text-zinc-900 leading-none">{p.qty_in} <span className="text-[10px] font-bold text-zinc-300 italic">PCS</span></span>
                                                    </div>
                                                    <div className="w-12 h-px bg-zinc-100 hidden sm:block"></div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 leading-none">Output Finish</span>
                                                        <span className="text-xl font-black text-blue-600 leading-none">{p.qty_out} <span className="text-[10px] font-bold text-blue-200 italic">PCS</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </DialogContent>
                    </DialogPortal>
                </Dialog>

                <ConfirmationDialog
                    open={confirmDelete.open}
                    onOpenChange={(open) => setConfirmDelete(prev => ({ ...prev, open }))}
                    title="Permanent Delete Confirmation?"
                    description="Warning: This action will permanently remove this record from the database. This process is irreversible and all associated data will be lost."
                    confirmLabel="Confirm Deletion"
                    variant="destructive"
                    onConfirm={handleDelete}
                    isLoading={confirmDelete.loading}
                />

                <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            </div >
        </>
    );
};
