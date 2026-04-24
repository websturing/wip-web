'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/Dialog";
import { Icon } from '@/app/components/ui/Icon';
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ProductionService } from "../../Production/services/ProductionService";
import { ProductivityService } from '../services/ProductivityService';

export const Productivity = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Manage date state through URL
    const currentDate = useMemo(() => {
        const dateFromUrl = searchParams.get('date');
        if (dateFromUrl) return dateFromUrl;

        // Default to yesterday
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }, [searchParams]);

    const [data, setData] = useState<any[]>([]);
    const [productionData, setProductionData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'summary'>('daily');

    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportType, setExportType] = useState<'productivity' | 'sewing_output'>('productivity');
    const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    useEffect(() => {
        if (isExportDialogOpen && data.length > 0) {
            setSelectedLineIds(Array.from(new Set(data.map(i => String(i.line_id)))));
        }
    }, [isExportDialogOpen, data]);

    // Grouping categories logic
    const getGroupCategory = (lineName: string) => {
        const name = lineName.toUpperCase();
        const isNS = name.includes('NS');
        const numPart = name.replace(/[^\d]/g, '');
        const num = parseInt(numPart);

        if (isNaN(num)) return 'OTHER';

        if (!isNS) {
            if (num >= 1 && num <= 8) return 'A1-8';
            if (num >= 9 && num <= 16) return 'A9-16';
        } else {
            if (num >= 1 && num <= 8) return 'A1-8 NS';
            if (num >= 9 && num <= 16) return 'A9-16 NS';
        }
        return 'OTHER';
    };

    // Sorted and categorized data
    const categorizedData = useMemo(() => {
        if (!data) return [];

        const categories = ['A1-8', 'A9-16', 'A1-8 NS', 'A9-16 NS', 'OTHER'];
        const grouped: { [key: string]: any[] } = {};

        categories.forEach(c => grouped[c] = []);

        const sorted = [...data].sort((a, b) => {
            const nameA = a.line?.name || '';
            const nameB = b.line?.name || '';
            const isNSA = nameA.toUpperCase().includes('NS');
            const isNSB = nameB.toUpperCase().includes('NS');
            if (isNSA !== isNSB) return isNSA ? 1 : -1;
            return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
        });

        sorted.forEach(item => {
            const cat = getGroupCategory(item.line?.name || '');
            grouped[cat].push(item);
        });

        return categories.map(cat => ({
            name: cat,
            items: grouped[cat]
        })).filter(g => g.items.length > 0);
    }, [data]);

    const availableLines = useMemo(() => {
        const linesMap = new Map();
        data.forEach(item => {
            if (item.line) {
                linesMap.set(String(item.line_id), item.line.name);
            }
        });
        return Array.from(linesMap.entries()).map(([id, name]) => ({ id, name }));
    }, [data]);

    const handleDateChange = (newDate: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', newDate);
        router.push(`/admin/productivity?${params.toString()}`);
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            ProductivityService.getAll(currentDate),
            ProductionService.getAll(currentDate)
        ]).then(([prodRes, outputRes]) => {
            if (prodRes.status === 'success') setData(prodRes.data);
            if (outputRes.status === 'success') setProductionData(outputRes.data);
        }).finally(() => setIsLoading(false));
    }, [currentDate]);

    // Helper to group lots in a productivity record by shared operational config
    const getGroupedLots = (item: any) => {
        const groups: { [key: string]: any[] } = {};
        const lots = (item.lots && item.lots.length > 0) ? item.lots : (item.lot ? [item.lot] : []);
        lots.forEach((l: any) => {
            const configKey = `${l.pivot?.smv}-${l.pivot?.manpower}-${l.pivot?.working_hour}-${l.pivot?.section}`;
            if (!groups[configKey]) groups[configKey] = [];
            groups[configKey].push(l);
        });
        return Object.values(groups);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:chart-square-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Productivity</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Real-time Performance Synchronization</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'daily' ? "bg-zinc-900 text-white shadow-xl" : "text-zinc-400 hover:text-zinc-900"
                            )}
                        >
                            Daily View
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'summary' ? "bg-zinc-900 text-white shadow-xl" : "text-zinc-400 hover:text-zinc-900"
                            )}
                        >
                            Target Sewing Output
                        </button>
                    </div>

                    <div className="h-12 w-px bg-zinc-200 mx-2"></div>

                    <input
                        type="date"
                        value={currentDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="h-12 px-5 bg-white border border-zinc-200 rounded-2xl text-[11px] font-bold text-zinc-900 outline-none focus:border-zinc-900 transition-all shadow-sm"
                    />

                    <button
                        onClick={() => setIsExportDialogOpen(true)}
                        className="h-12 px-6 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-zinc-50 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Icon icon="solar:file-text-bold-duotone" className="w-4 h-4 text-emerald-500" />
                        <span>Export Daily</span>
                    </button>

                    <button
                        onClick={() => router.push(`/admin/productivity/create?date=${currentDate}`)}
                        className="h-12 px-8 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Icon icon="solar:add-square-bold" className="w-4 h-4" />
                        <span>New Log</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                {activeTab === 'daily' ? (
                                    <>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Line</th>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Visual</th>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest scale-95 origin-left">Buyer / Style</th>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest scale-95 origin-left">GL</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">MP (Act/Pln)</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">MG</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">WH</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">SMV</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Target</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Output</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Achv</th>
                                        <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Bal</th>
                                        <th className="px-3 py-3 text-right text-[8px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-3 py-3 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50/50">Visual</th>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[130px]">Buyer / Style</th>
                                        <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[110px]">GL</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">MP Plan</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">Tgt Plan</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">MP Act</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center bg-zinc-50/50">Tgt Act</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">DO (Output)</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">Last Step</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center whitespace-nowrap">Diff L-Step</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center border-l border-zinc-100 whitespace-nowrap">Diff T.Act</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">% T.Act</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center border-l border-zinc-100 whitespace-nowrap">Diff T.Pln</th>
                                        <th className="px-2 py-3 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">% T.Pln</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 text-[10px]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={20} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 w-full">
                                            <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Synchronizing...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-10 w-full font-black uppercase text-[10px]">No Data Available</div>
                                    </td>
                                </tr>
                            ) : (
                                categorizedData.map(group => {
                                    let groupTarget = 0;
                                    let groupOutput = 0;
                                    let groupMP = 0;
                                    let groupSew = 0;
                                    let groupTPln = 0;
                                    let groupMPPln = 0;

                                    return (
                                        <Fragment key={group.name}>
                                            <tr className="bg-zinc-100/30">
                                                <td colSpan={13} className="px-4 py-2 text-[10px] font-black text-zinc-900 uppercase tracking-widest border-l-4 border-zinc-900">
                                                    Group {group.name}
                                                </td>
                                            </tr>
                                            {group.items.map((item: any) => {
                                                const groupedLots = getGroupedLots(item);
                                                return groupedLots.map((lotGroup: any[], gIdx: number) => {
                                                    const firstLot = lotGroup[0];
                                                    const rowId = `${item.id}-${gIdx}`;
                                                    const isExpanded = expandedRows.includes(rowId);

                                                    const section = (firstLot.pivot?.section || 'ALL').toUpperCase();
                                                    const rawLots = lotGroup.map(l => l.lot_code?.replace(/^0+/, '')).filter(Boolean).join(' + ');
                                                    const combinedLots = `${rawLots} - (${section})`;

                                                    const combinedStyles = Array.from(new Set(lotGroup.map(l => l.style_no).filter(Boolean))).join(' / ');
                                                    const combinedBuyers = Array.from(new Set(lotGroup.map(l => l.gl_group?.customer?.name).filter(Boolean))).join(' / ');
                                                    const combinedColors = Array.from(new Set(
                                                        lotGroup.flatMap(l =>
                                                            productionData
                                                                .filter(p => String(p.line_id) === String(item.line_id))
                                                                .flatMap(p => p.items || [])
                                                                .filter(pi => String(pi.lot_id) === String(l.id))
                                                                .map(pi => pi.color)
                                                        ).filter(Boolean)
                                                    )).join(' / ');

                                                    const lotOutput = lotGroup.reduce((sum, l) => {
                                                        return sum + productionData
                                                            .filter(p => String(p.line_id) === String(item.line_id))
                                                            .flatMap(p => p.items || [])
                                                            .filter(pi => String(pi.lot_id) === String(l.id))
                                                            .reduce((s, pi) => s + (pi.details || []).reduce((ss: number, d: any) => ss + (Number(d.qty_output) || 0), 0), 0);
                                                    }, 0);

                                                    const smv = Number(lotGroup.length === 1 && !item.lots?.length ? item.smv : firstLot.pivot?.smv);
                                                    const mp = Number(lotGroup.length === 1 && !item.lots?.length ? item.manpower : firstLot.pivot?.manpower);
                                                    const sew = Number(lotGroup.length === 1 && !item.lots?.length ? item.sewer : firstLot.pivot?.sewer);
                                                    const wh = Number(lotGroup.length === 1 && !item.lots?.length ? item.working_hour : firstLot.pivot?.working_hour);
                                                    const tgtAct = smv > 0 ? Math.floor(((mp + sew) * wh * 60) / smv) : 0;
                                                    const tgtPln = Number(firstLot.pivot?.target_plan || item.target_plan || 0);
                                                    const mpPln = Number(firstLot.pivot?.plan_manpower || item.plan_manpower || 0);

                                                    // Collect totals
                                                    groupTarget += tgtAct;
                                                    groupOutput += lotOutput;
                                                    groupMP += mp;
                                                    groupSew += sew;
                                                    groupTPln += tgtPln;
                                                    groupMPPln += mpPln;

                                                    if (activeTab === 'daily') {
                                                        return (
                                                            <Fragment key={rowId}>
                                                                <tr className="group hover:bg-zinc-50 border-b border-zinc-50">
                                                                    <td className="px-3 py-2">{gIdx === 0 && <span className="font-black text-zinc-900">{item.line?.name}</span>}</td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                                                                            {(firstLot.pivot?.media_url || firstLot.pivot?.media?.url) ? <img src={firstLot.pivot.media_url || firstLot.pivot.media.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon icon="solar:gallery-bold" className="w-3 h-3 text-zinc-300" /></div>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex flex-col max-w-[120px]">
                                                                            <span className="font-black text-amber-600 truncate" title={combinedBuyers}>{combinedBuyers}</span>
                                                                            <span className="text-[7px] text-zinc-400 font-bold truncate tracking-widest" title={combinedStyles}>{combinedStyles}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-bold text-zinc-700">{combinedLots}</span>
                                                                                {lotGroup.length > 1 && <button onClick={() => toggleRow(rowId)} className={cn("p-0.5 rounded bg-zinc-50", isExpanded && "rotate-180 bg-zinc-900 text-white")}><Icon icon="solar:alt-arrow-down-bold" className="w-2 h-2" /></button>}
                                                                            </div>
                                                                            {combinedColors && <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider">{combinedColors}</span>}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center font-bold text-blue-600">{mp} / <span className="text-zinc-300">{mpPln}</span></td>
                                                                    <td className="px-3 py-2 text-center font-black text-emerald-600">{sew}</td>
                                                                    <td className="px-3 py-2 text-center text-zinc-400">{wh}H</td>
                                                                    <td className="px-3 py-2 text-center text-zinc-400">{smv}</td>
                                                                    <td className="px-3 py-2 text-center font-bold">{tgtAct}</td>
                                                                    <td className="px-3 py-2 text-center font-black text-blue-700">{lotOutput}</td>
                                                                    <td className="px-3 py-2 text-center">
                                                                        <span className={cn("px-1.5 py-0.5 rounded-[4px] text-[7px] font-black", (tgtAct > 0 ? (lotOutput / tgtAct) * 100 : 0) >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                                                            {tgtAct > 0 ? Math.round((lotOutput / tgtAct) * 100) : 0}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center font-bold">{tgtAct - lotOutput}</td>
                                                                    <td className="px-3 py-2 text-right">
                                                                        {gIdx === 0 && (
                                                                            <div className="flex items-center justify-end gap-1">
                                                                                <button onClick={() => router.push(`/admin/productivity/edit/${item.id}`)} className="p-1.5 rounded-lg bg-zinc-50 text-zinc-400 hover:text-blue-600 transition-all"><Icon icon="solar:pen-bold" className="w-3 h-3" /></button>
                                                                                <button onClick={async () => { if (confirm('Delete?')) { await ProductivityService.delete(item.id); setData(prev => prev.filter(i => i.id !== item.id)); } }} className="p-1.5 rounded-lg bg-zinc-50 text-zinc-400 hover:text-red-600 transition-all"><Icon icon="solar:trash-bin-trash-bold" className="w-3 h-3" /></button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                                {isExpanded && lotGroup.map((subL: any) => {
                                                                    const sOutput = productionData.filter(p => String(p.line_id) === String(item.line_id)).flatMap(p => p.items || []).filter(pi => String(pi.lot_id) === String(subL.id)).reduce((s, pi) => s + (pi.details || []).reduce((ss: number, d: any) => ss + (Number(d.qty_output) || 0), 0), 0);
                                                                    return (
                                                                        <tr key={`sub-${subL.id}`} className="bg-zinc-50/50 border-l-2 border-emerald-400">
                                                                            <td colSpan={3}></td>
                                                                            <td className="px-3 py-1.5 opacity-50 font-bold flex flex-col">
                                                                                <span>Lot {subL.lot_code?.replace(/^0+/, '')}</span>
                                                                                {productionData.filter(p => String(p.line_id) === String(item.line_id)).flatMap(p => p.items || []).filter(pi => String(pi.lot_id) === String(subL.id)).map(pi => pi.color).filter(Boolean)[0] && (
                                                                                    <span className="text-[6px] uppercase tracking-tighter opacity-70">
                                                                                        {productionData.filter(p => String(p.line_id) === String(item.line_id)).flatMap(p => p.items || []).filter(pi => String(pi.lot_id) === String(subL.id)).map(pi => pi.color).filter(Boolean)[0]}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td colSpan={5}></td>
                                                                            <td className="px-3 py-1.5 text-center font-bold text-blue-400">{sOutput}</td>
                                                                            <td colSpan={3}></td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </Fragment>
                                                        );
                                                    } else {
                                                        const lastStep = Math.max(...lotGroup.map(l => Number(l.pivot?.last_step || 0)));
                                                        return (
                                                            <tr key={rowId} className="hover:bg-zinc-50">
                                                                <td className="px-3 py-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                                                                        {(firstLot.pivot?.media_url || firstLot.pivot?.media?.url) ? <img src={firstLot.pivot.media_url || firstLot.pivot.media.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon icon="solar:gallery-bold" className="w-3 h-3 text-zinc-300" /></div>}
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2 text-[10px]">
                                                                    <div className="flex flex-col max-w-[120px]">
                                                                        <span className="font-bold text-zinc-900 uppercase truncate leading-none mb-1">{item.line?.name}</span>
                                                                        <span className="font-black text-amber-600 truncate" title={combinedBuyers}>{combinedBuyers}</span>
                                                                        <span className="text-[7px] text-zinc-400 font-bold truncate tracking-widest" title={combinedStyles}>{combinedStyles}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-zinc-700">{combinedLots}</span>
                                                                        {combinedColors && <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider">{combinedColors}</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="px-2 py-2 text-center font-bold text-zinc-400 bg-zinc-50/50">{mpPln}</td>
                                                                <td className="px-2 py-2 text-center font-black text-emerald-600 bg-zinc-50/50">{tgtPln}</td>
                                                                <td className="px-2 py-2 text-center font-black text-blue-600">{mp + sew}</td>
                                                                <td className="px-2 py-2 text-center font-black bg-zinc-50/50">{tgtAct}</td>
                                                                <td className="px-2 py-2 text-center font-black text-blue-700">{lotOutput}</td>
                                                                <td className="px-2 py-2 text-center font-black text-orange-500">{lastStep}</td>
                                                                <td className={cn("px-2 py-2 text-center font-black", (lastStep - lotOutput) < 0 ? "text-emerald-500" : "text-amber-500")}>{lastStep - lotOutput}</td>
                                                                <td className={cn("px-2 py-2 text-center font-black border-l", (lotOutput - tgtAct) < 0 ? "text-red-500" : "text-emerald-600")}>{lotOutput - tgtAct > 0 ? `+${lotOutput - tgtAct}` : (lotOutput - tgtAct)}</td>
                                                                <td className={cn("px-2 py-2 text-center font-black", (tgtAct > 0 ? (lotOutput / tgtAct) * 100 : 0) < 80 ? "text-red-500" : "text-emerald-600")}>{tgtAct > 0 ? Math.round((lotOutput / tgtAct) * 100) : 0}%</td>
                                                                <td className={cn("px-2 py-2 text-center font-black border-l", (lotOutput - tgtPln) < 0 ? "text-red-500" : "text-emerald-600")}>{lotOutput - tgtPln > 0 ? `+${lotOutput - tgtPln}` : (lotOutput - tgtPln)}</td>
                                                                <td className={cn("px-2 py-2 text-center font-black", (tgtPln > 0 ? (lotOutput / tgtPln) * 100 : 0) < 80 ? "text-red-500" : "text-emerald-600")}>{tgtPln > 0 ? Math.round((lotOutput / tgtPln) * 100) : 0}%</td>
                                                            </tr>
                                                        );
                                                    }
                                                });
                                            })}
                                            {/* Group Total Row */}
                                            <tr className="bg-zinc-100/80 text-zinc-900 font-black uppercase tracking-widest text-[9px] border-y border-zinc-200/50">
                                                <td className="px-4 py-3" colSpan={4}>Total Group {group.name}</td>
                                                {activeTab === 'daily' ? (
                                                    <>
                                                        <td className="px-3 py-3 text-center text-blue-400">{groupMP} / {groupMPPln}</td>
                                                        <td className="px-3 py-3 text-center text-emerald-400">{groupSew}</td>
                                                        <td colSpan={2}></td>
                                                        <td className="px-3 py-3 text-center text-zinc-900">{groupTarget}</td>
                                                        <td className="px-3 py-3 text-center text-blue-800">{groupOutput}</td>
                                                        <td className="px-3 py-3 text-center">
                                                            <div className="bg-zinc-900/5 px-2 py-1 rounded inline-block text-zinc-900">
                                                                {groupTarget > 0 ? Math.round((groupOutput / groupTarget) * 100) : 0}%
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center text-zinc-600">{groupTarget - groupOutput}</td>
                                                        <td></td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-2 py-3 text-center text-zinc-500">{groupMPPln}</td>
                                                        <td className="px-2 py-3 text-center text-emerald-600">{groupTPln}</td>
                                                        <td className="px-2 py-3 text-center text-blue-600">{groupMP + groupSew}</td>
                                                        <td className="px-2 py-3 text-center text-zinc-900">{groupTarget}</td>
                                                        <td className="px-2 py-3 text-center text-blue-800">{groupOutput}</td>
                                                        <td colSpan={6} className="text-right pr-4">
                                                            AVG ACHIEVEMENT: {groupTarget > 0 ? Math.round((groupOutput / groupTarget) * 100) : 0}%
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Dialog */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-zinc-900 text-white">
                        <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <Icon icon="solar:file-download-bold" className="w-5 h-5 text-emerald-400" />
                            Select Lines to Export
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                        {/* Report Type Selection */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Report Type</span>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setExportType('productivity')}
                                    className={cn(
                                        "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                                        exportType === 'productivity' ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-zinc-50 hover:border-zinc-300 text-zinc-500"
                                    )}
                                >
                                    <Icon icon="solar:chart-square-bold-duotone" className="w-6 h-6" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Performance</span>
                                </button>
                                <button
                                    onClick={() => setExportType('sewing_output')}
                                    className={cn(
                                        "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                                        exportType === 'sewing_output' ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-zinc-50 hover:border-zinc-300 text-zinc-500"
                                    )}
                                >
                                    <Icon icon="solar:t-shirt-bold-duotone" className="w-6 h-6" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Sewing Output</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Selected Lines</span>
                            <div className="space-y-2">
                                {availableLines.map(l => (
                                    <label key={l.id} className={cn("flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all", selectedLineIds.includes(l.id) ? "bg-zinc-900 border-zinc-900 text-white" : "bg-zinc-50 hover:border-zinc-300")}>
                                        <span className="font-bold">Line {l.name}</span>
                                        <input type="checkbox" checked={selectedLineIds.includes(l.id)} className="hidden" onChange={() => setSelectedLineIds(p => p.includes(l.id) ? p.filter(id => id !== l.id) : [...p, l.id])} />
                                        {selectedLineIds.includes(l.id) && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-400" />}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6 bg-zinc-50 border-t flex justify-between">
                        <button onClick={() => setIsExportDialogOpen(false)} className="px-6 py-2 text-[10px] font-black uppercase text-zinc-400">Cancel</button>
                        <button
                            onClick={async () => {
                                await ProductivityService.exportDailyReport(currentDate, selectedLineIds, exportType);
                                setIsExportDialogOpen(false);
                            }}
                            className="bg-zinc-900 text-white px-8 py-2 rounded-xl font-black uppercase text-[10px] shadow-xl shadow-zinc-200 active:scale-95 transition-all"
                        >
                            Generate Report
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
