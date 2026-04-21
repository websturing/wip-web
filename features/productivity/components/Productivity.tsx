'use client';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/Dialog";
import { Icon } from '@/app/components/ui/Icon';
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
    const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);

    useEffect(() => {
        if (isExportDialogOpen && data.length > 0) {
            setSelectedLineIds(Array.from(new Set(data.map(i => String(i.line_id)))));
        }
    }, [isExportDialogOpen, data]);

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

    // Grouping by Buyer logic (for summary)
    const groupedByBuyer = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        data.forEach(item => {
            const buyer = item.lots?.[0]?.gl_group?.customer?.name || 'Unknown Buyer';
            if (!groups[buyer]) groups[buyer] = [];
            groups[buyer].push(item);
        });
        return groups;
    }, [data]);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header section identical to other pages */}
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
                            {activeTab === 'daily' ? (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Line</th>
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Visual</th>
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest scale-95 origin-left">Buyer / Style</th>
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest scale-95 origin-left">GL / Lot</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">MP (Act/Pln)</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">MG</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">WH</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">SMV</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Target</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Output</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Achv</th>
                                    <th className="px-3 py-3 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Bal</th>
                                    <th className="px-3 py-3 text-right text-[8px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                                </tr>
                            ) : (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-3 py-3 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50/50">Visual</th>
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[130px]">Buyer / Style</th>
                                    <th className="px-3 py-3 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[110px]">GL / Lot</th>
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
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={20} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 w-full">
                                            <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Synchronizing Intelligence...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 opacity-10 w-full">
                                            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-16 h-16" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Data Available</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : activeTab === 'daily' ? (
                                data.map((item) => {
                                    const lots = (item.lots && item.lots.length > 0) ? item.lots : (item.lot ? [item.lot] : []);

                                    return lots.map((l: any, lIdx: number) => {
                                        // Calculate production output for this specific style ON THIS LINE
                                        // Safety: Use a Map to prevent double-counting if there are duplicate size entries for the same item
                                        const lineOutput = productionData
                                            .filter(p => String(p.line_id) === String(item.line_id))
                                            .flatMap(p => p.items || [])
                                            .filter(pi => String(pi.lot_id) === String(l.id))
                                            .reduce((sum, pi) => {
                                                const itemQty = (pi.details || []).reduce((s: number, d: any) => s + (Number(d.qty_output) || 0), 0);
                                                return sum + itemQty;
                                            }, 0);

                                        // PRIORITY LOGIC:
                                        // 1. If multi-lot: use pivot values
                                        // 2. If single-lot: use main Productivity model attributes as fallback
                                        const smv = lots.length === 1 ? Number(item.smv) : (Number(l.pivot?.smv) || Number(item.smv));
                                        const manpower = lots.length === 1 ? Number(item.manpower) : (Number(l.pivot?.manpower) || (lIdx === 0 ? Number(item.manpower) : 0));
                                        const mg = lots.length === 1 ? Number(item.sewer) : (Number(l.pivot?.sewer) || (lIdx === 0 ? Number(item.sewer) : 0));
                                        const wh = lots.length === 1 ? Number(item.working_hour) : (Number(l.pivot?.working_hour) || Number(item.working_hour));
                                        const section = l.pivot?.section || 'all';

                                        // Formula: (MP + MG) * WH * 60 / SMV
                                        const dailyTarget = smv > 0
                                            ? Math.floor(((manpower + mg) * wh * 60) / smv)
                                            : 0;

                                        const achieved = dailyTarget > 0 ? Math.round((lineOutput / dailyTarget) * 100) : 0;
                                        const balance = dailyTarget - lineOutput;

                                        // Formatting Lot Code
                                        const lotCode = l.lot_code?.replace(/^0+/, '');
                                        const glNumber = l.gl_group?.gl_number || '';

                                        return (
                                            <tr key={`${item.id}-${l.id}`} className="group hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-3 py-2">
                                                    {lIdx === 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                            <span className="text-[10px] font-black text-zinc-900 uppercase">{item.line?.name}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shadow-sm">
                                                        {(l.pivot?.media_url || l.pivot?.media?.url) ? (
                                                            <img src={l.pivot.media_url || l.pivot.media.url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                                <Icon icon="solar:gallery-bold-duotone" className="w-4 h-4 opacity-30" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-[10px] font-extrabold text-amber-600 uppercase truncate max-w-[130px]">{l.gl_group?.customer?.name || 'Unknown Buyer'}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[130px]">{l.style_no || 'Unknown Style'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-col scale-95 origin-left">
                                                        <span className="text-[10px] font-bold text-zinc-700">{glNumber}</span>
                                                        <span className="text-[7px] font-bold text-zinc-400 uppercase">Lot: {lotCode}</span>
                                                        <div className="mt-1">
                                                            <span className="text-[7px] font-black bg-blue-50 text-blue-500 px-1 py-0.5 rounded uppercase tracking-tighter shadow-sm border border-blue-100/50">{section}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[10px] font-bold text-blue-600">
                                                        {manpower} <span className="text-zinc-300 mx-0.5 text-[8px]">/</span> <span className="text-zinc-400 font-medium">{lots.length === 1 ? Number(item.plan_manpower) : (Number(l.pivot?.plan_manpower) || (lIdx === 0 ? Number(item.plan_manpower) : 0))}</span>
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[10px] font-black text-emerald-600">
                                                        {mg}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[10px] font-bold text-zinc-500">
                                                        {wh}H
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[9px] font-black text-zinc-400">{Number(smv)}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[10px] font-bold text-zinc-800 tabular-nums">{Number(dailyTarget)}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className="text-[10px] font-extrabold text-blue-600 tabular-nums">{Number(lineOutput)}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest uppercase",
                                                        achieved >= 100 ? "bg-emerald-100 text-emerald-700" : achieved >= 80 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {achieved}%
                                                    </div>
                                                </td>
                                                <td className={cn(
                                                    "px-3 py-2 text-center text-[9px] font-bold tabular-nums",
                                                    balance > 0 ? "text-zinc-500" : "text-emerald-500"
                                                )}>
                                                    {balance}
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    {lIdx === 0 ? (
                                                        <div className="flex items-center justify-end gap-1.5 transition-all">
                                                            <button onClick={() => router.push(`/admin/productivity/edit/${item.id}`)} className="p-1 rounded-lg bg-zinc-100 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90">
                                                                <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => ProductivityService.exportExcel(item.id, `Productivity_${item.line?.name || 'Line'}_${item.date}.xlsx`)} className="p-1 rounded-lg bg-zinc-100 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90">
                                                                <Icon icon="solar:file-download-bold-duotone" className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={async () => {
                                                                if (confirm('Delete this record?')) {
                                                                    await ProductivityService.delete(item.id);
                                                                    setData(prev => prev.filter(i => i.id !== item.id));
                                                                }
                                                            }} className="p-1 rounded-lg bg-zinc-100 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90">
                                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-8"></div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    });
                                })
                            ) : (
                                Object.entries(groupedByBuyer).map(([buyer, items]) => {
                                    return items.map((item, iIdx) => {
                                        const lots = (item.lots && item.lots.length > 0) ? item.lots : (item.lot ? [item.lot] : []);
                                        return lots.map((l: any, lIdx: number) => {
                                            const totalOutput = productionData
                                                .filter(p => String(p.line_id) === String(item.line_id))
                                                .flatMap(p => p.items || [])
                                                .filter(pi => String(pi.lot_id) === String(l.id))
                                                .reduce((sum, pi) => {
                                                    const itemQty = (pi.details || []).reduce((s: number, d: any) => s + (Number(d.qty_output) || 0), 0);
                                                    return sum + itemQty;
                                                }, 0);

                                            // Formulas exactly match productivity dash logic
                                            const smvVal = Number(l.pivot?.smv || item.smv || 0);
                                            const mpVal = Number(l.pivot?.manpower || item.manpower || 0);
                                            const mgVal = Number(l.pivot?.sewer || item.sewer || 0);
                                            const whVal = Number(l.pivot?.working_hour || item.working_hour || 8);
                                            const section = l.pivot?.section || 'all';

                                            const tgtAct = smvVal > 0 ? Math.floor(((mpVal + mgVal) * whVal * 60) / smvVal) : 0;
                                            const tgtPlan = Number(l.pivot?.target_plan || item.target_plan || 0);

                                            const diffLStep = (Number(l.pivot?.last_step || 0) - totalOutput);
                                            const diffTAct = (totalOutput - tgtAct);
                                            const pctTAct = tgtAct > 0 ? Math.round((totalOutput / tgtAct) * 100) : 0;
                                            const diffTPln = (totalOutput - tgtPlan);
                                            const pctTPln = tgtPlan > 0 ? Math.round((totalOutput / tgtPlan) * 100) : 0;

                                            return (
                                                <tr key={`${item.id}-${l.id}`} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100">
                                                    <td className="px-3 py-2">
                                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                                                            {(l.pivot?.media_url || l.pivot?.media?.url) ? (
                                                                <img src={l.pivot.media_url || l.pivot.media.url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                                    <Icon icon="solar:gallery-bold-duotone" className="w-4 h-4 opacity-30" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex flex-col leading-tight min-w-[100px]">
                                                            <span className="text-[10px] font-black text-zinc-900 uppercase truncate">{item.line?.name}</span>
                                                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate">{l.gl_group?.customer?.name} - {l.style_no}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex flex-col scale-90 origin-left">
                                                            <span className="text-[10px] font-bold text-zinc-700">{l.gl_group?.gl_number}</span>
                                                            <span className="text-[7px] font-bold text-zinc-400 uppercase">Lot: {l.lot_code?.replace(/^0+/, '')}</span>
                                                            <div className="mt-1">
                                                                <span className="text-[7px] font-black bg-blue-50 text-blue-500 px-1 py-0.5 rounded uppercase tracking-tighter border border-blue-100/50">{section}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-bold text-zinc-500 tabular-nums bg-zinc-50/30">
                                                        {Number(l.pivot?.plan_manpower || 0)}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-black text-emerald-600 tabular-nums bg-zinc-50/30">
                                                        {tgtPlan}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-black text-blue-600 tabular-nums">
                                                        {mpVal + mgVal}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-black text-zinc-900 tabular-nums bg-zinc-50/30">
                                                        {tgtAct}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-black text-blue-700 tabular-nums">
                                                        {totalOutput}
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-[10px] font-bold text-orange-500 tabular-nums">
                                                        {l.pivot?.last_step || 0}
                                                    </td>
                                                    <td className={cn("px-2 py-2 text-center text-[10px] font-black tabular-nums", diffLStep < 0 ? "text-emerald-500" : "text-amber-600")}>
                                                        {diffLStep}
                                                    </td>
                                                    <td className={cn("px-2 py-2 text-center text-[10px] font-black tabular-nums border-l border-zinc-50", diffTAct < 0 ? "text-red-500" : "text-emerald-600")}>
                                                        {diffTAct > 0 ? `+${diffTAct}` : diffTAct}
                                                    </td>
                                                    <td className={cn("px-2 py-2 text-center text-[10px] font-black tabular-nums", pctTAct < 80 ? "text-red-500" : pctTAct < 100 ? "text-amber-500" : "text-emerald-500")}>
                                                        {pctTAct}%
                                                    </td>
                                                    <td className={cn("px-2 py-2 text-center text-[10px] font-black tabular-nums border-l border-zinc-50", diffTPln < 0 ? "text-red-500" : "text-emerald-600")}>
                                                        {diffTPln > 0 ? `+${diffTPln}` : diffTPln}
                                                    </td>
                                                    <td className={cn("px-2 py-2 text-center text-[10px] font-black tabular-nums", pctTPln < 80 ? "text-red-500" : pctTPln < 100 ? "text-amber-500" : "text-emerald-500")}>
                                                        {pctTPln}%
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    });
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Export Selection Dialog */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="max-w-md bg-white rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-zinc-900 text-white">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                            <Icon icon="solar:file-text-bold-duotone" className="w-6 h-6 text-emerald-400" />
                            Select Lines to Export
                        </DialogTitle>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Daily Report: {currentDate}</p>
                    </DialogHeader>

                    <div className="p-8 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                            <span className="text-[10px] font-black uppercase text-zinc-400">Available Lines</span>
                            <button
                                onClick={() => {
                                    if (selectedLineIds.length === availableLines.length) setSelectedLineIds([]);
                                    else setSelectedLineIds(availableLines.map(l => l.id));
                                }}
                                className="text-[10px] font-black text-blue-600 uppercase hover:underline"
                            >
                                {selectedLineIds.length === availableLines.length ? 'Unselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {availableLines.length > 0 ? availableLines.map((line) => (
                                <label
                                    key={line.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                        selectedLineIds.includes(line.id)
                                            ? "bg-zinc-900 border-zinc-900 text-white"
                                            : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                                            selectedLineIds.includes(line.id) ? "bg-zinc-800" : "bg-white shadow-sm"
                                        )}>
                                            {line.name}
                                        </div>
                                        <span className="font-bold text-sm">Line {line.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={selectedLineIds.includes(line.id)}
                                        onChange={() => {
                                            if (selectedLineIds.includes(line.id)) {
                                                setSelectedLineIds(prev => prev.filter(id => id !== line.id));
                                            } else {
                                                setSelectedLineIds(prev => [...prev, line.id]);
                                            }
                                        }}
                                    />
                                    {selectedLineIds.includes(line.id) && (
                                        <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-emerald-400" />
                                    )}
                                </label>
                            )) : (
                                <div className="py-10 text-center text-zinc-400">
                                    <Icon icon="solar:ghost-bold" className="w-8 h-8 mx-auto opacity-20 mb-2" />
                                    <p className="text-[10px] font-black uppercase">No active lines today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between sm:justify-between">
                        <button
                            onClick={() => setIsExportDialogOpen(false)}
                            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={selectedLineIds.length === 0}
                            onClick={async () => {
                                await ProductivityService.exportDailyReport(currentDate, selectedLineIds);
                                setIsExportDialogOpen(false);
                            }}
                            className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            <Icon icon="solar:file-download-bold" className="w-4 h-4" />
                            Generate Report
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
