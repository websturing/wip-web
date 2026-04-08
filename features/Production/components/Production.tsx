'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useProduction } from '../hooks/useProduction';
import { ProductionService } from '../services/ProductionService';

export const Production = () => {
    const router = useRouter();
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: productions, isLoading, refresh } = useProduction({ date: viewDate });

    // Filters
    const [filterLine, setFilterLine] = useState<string>('ALL');
    const [filterGL, setFilterGL] = useState<string>('ALL');
    const [filterLot, setFilterLot] = useState<string>('ALL');

    const [expandedGLs, setExpandedGLs] = useState<Record<string, boolean>>({});

    // Helper to format GL Number (Remove leading zeros + suffix -00 if missing)
    const formatGL = useCallback((gl: string) => {
        if (!gl || gl === 'ALL') return gl;
        const clean = gl.replace(/^0+/, '');
        return clean.includes('-') ? clean : `${clean}-00`;
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
            lines: ['ALL', ...Array.from(lines).sort()],
            gls: ['ALL', ...Array.from(gls).sort((a, b) => formatGL(a).localeCompare(formatGL(b)))],
            lots: ['ALL', ...Array.from(lots).sort()]
        };
    }, [productions, formatGL]);

    // Apply filters and group by GL + Lot
    const groupedData = useMemo(() => {
        if (!productions) return {};

        const groups: Record<string, any> = {};

        productions.forEach((p: any) => {
            // Apply Line Filter
            if (filterLine !== 'ALL' && p.line?.name !== filterLine) return;

            p.items?.forEach((item: any) => {
                const glNoRaw = item.lot?.gl_group?.gl_number || 'Unknown GL';
                const lotCode = item.lot?.lot_code || 'Unknown Lot';
                const lotClean = item.lot?.lot_number?.replace(/^0+/, '') || 'N/A';

                // Apply GL/Lot Filters
                if (filterGL !== 'ALL' && glNoRaw !== filterGL) return;
                if (filterLot !== 'ALL' && lotCode !== filterLot) return;

                const glNo = formatGL(glNoRaw);
                const groupKey = `${glNo}-${lotCode}`;

                if (!groups[groupKey]) {
                    groups[groupKey] = {
                        glNo,
                        lotCode,
                        lotClean,
                        total_in: 0,
                        total_out: 0,
                        entries: []
                    };
                }

                const entry = {
                    ...p,
                    qty_in: item.details.reduce((sum: number, d: any) => sum + d.qty_input, 0),
                    qty_out: item.details.reduce((sum: number, d: any) => sum + d.qty_output, 0),
                    color: item.color,
                    item_details: item.details
                };

                groups[groupKey].total_in += entry.qty_in;
                groups[groupKey].total_out += entry.qty_out;
                groups[groupKey].entries.push(entry);
            });
        });

        return groups;
    }, [productions, filterLine, filterGL, filterLot, formatGL]);

    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

    const toggleCard = (key: string) => {
        setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isLoading) return (
        <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filtering Report...</span>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Header Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:filters-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Production Feed</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Today's Performance Overview</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-zinc-100 shadow-sm">
                    <input
                        type="date"
                        value={viewDate}
                        onChange={(e) => setViewDate(e.target.value)}
                        className="bg-zinc-50 border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none ring-0 h-10"
                    />

                    <div className="w-40">
                        <Select
                            options={filterOptions.lines.map(l => ({ id: l, label: l === 'ALL' ? 'All Lines' : l, value: l }))}
                            value={filterLine}
                            onChange={(val) => setFilterLine(String(val))}
                            placeholder="Select Line"
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            options={filterOptions.gls.map(g => ({ id: g, label: g === 'ALL' ? 'All GLs' : formatGL(g), value: g }))}
                            value={filterGL}
                            onChange={(val) => setFilterGL(String(val))}
                            placeholder="Select GL"
                        />
                    </div>

                    <div className="w-48">
                        <Select
                            options={filterOptions.lots.map(l => ({ id: l, label: l === 'ALL' ? 'All Lots' : l, value: l }))}
                            value={filterLot}
                            onChange={(val) => setFilterLot(String(val))}
                            placeholder="Select Lot"
                        />
                    </div>

                    <input
                        type="file"
                        id="production-import"
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Using local state to manage loading if needed
                            const confirmed = confirm('Import production data from this Excel?');
                            if (!confirmed) return;

                            try {
                                const result = await ProductionService.importExcel(file);
                                if (result.status === 'success' && result.summary) {
                                    alert(`Import Success!\nTotal: ${result.summary.total}\nInserted: ${result.summary.inserted}\nErrors: ${result.summary.errors.length}`);
                                    refresh();
                                } else {
                                    alert(`Import failed: ${result.message || 'Unknown error'}`);
                                }
                            } catch (error) {
                                console.error('Import failed:', error);
                                alert('Failed to import production data.');
                            } finally {
                                if (e.target) e.target.value = '';
                            }
                        }}
                    />
                    <Button
                        variant="ghost"
                        onClick={() => document.getElementById('production-import')?.click()}
                        className="bg-white hover:bg-zinc-50 text-zinc-600 rounded-2xl px-4 h-10 flex items-center gap-2 transition-all border border-zinc-100 shadow-sm text-[10px] font-black uppercase tracking-widest"
                    >
                        <Icon icon="solar:file-send-bold-duotone" className="w-4 h-4 text-blue-500" />
                        <span>Import</span>
                    </Button>

                    <Button
                        onClick={() => router.push('/admin/production/create')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-10 flex items-center gap-2 transition-all shadow-md active:scale-95 text-xs font-bold"
                    >
                        <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                        <span>Log</span>
                    </Button>
                </div>
            </div>

            {/* Production List (Grouped by GL & Lot) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                {Object.keys(groupedData).length === 0 ? (
                    <div className="col-span-full py-32 bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                        <Icon icon="solar:ghost-bold-duotone" className="w-12 h-12 opacity-10 mb-6" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">No data matching filters</p>
                    </div>
                ) : (
                    Object.entries(groupedData).map(([key, data]: [string, any]) => (
                        <div key={key} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl h-fit">
                            {/* Card Header (GL + Lot) */}
                            <button
                                onClick={() => toggleCard(key)}
                                className="w-full p-6 flex flex-col bg-zinc-50/50 hover:bg-zinc-100/50 transition-colors group relative border-b border-zinc-100"
                            >
                                <div className="flex items-center justify-between w-full mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <span className="text-[10px] font-black leading-none mb-0.5">LOT</span>
                                            <span className="text-sm font-black leading-none">{data.lotClean}</span>
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Garment Reference</h3>
                                            <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">GL: {data.glNo}</p>
                                        </div>
                                    </div>
                                    <div className={cn("p-2 rounded-xl bg-white border border-zinc-200 transition-transform duration-500 shadow-sm", expandedCards[key] && "rotate-180")}>
                                        <Icon icon="solar:alt-arrow-down-bold" className="w-3 h-3 text-zinc-400" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                                    <div className="flex flex-col items-start border-r border-zinc-100 pr-6 flex-1">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total In</span>
                                        <span className="text-sm font-black text-zinc-900">{data.total_in}</span>
                                    </div>
                                    <div className="flex flex-col items-end pl-6 flex-1">
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
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest leading-none mb-1">{p.line?.name}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase leading-none">{p.creator?.name?.split(' ')[0]}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.color}</span>
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
                    ))
                )}
            </div>
        </div>
    );
};
