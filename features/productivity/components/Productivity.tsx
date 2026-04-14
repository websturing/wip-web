'use client';

import { Button } from '@/app/components/ui/Button';
import { DatePicker } from '@/app/components/ui/DatePicker';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductionService } from '../../Production/services/ProductionService';
import { ProductivityService } from '../services/ProductivityService';

export const Productivity = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any[]>([]);
    const [productionData, setProductionData] = useState<any[]>([]);
    const [cumulativeSummaries, setCumulativeSummaries] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'target'>('daily');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [prodRes, outputRes] = await Promise.all([
                ProductivityService.getAll(date),
                ProductionService.getAll(date)
            ]);

            if (prodRes.status === 'success') {
                const sortedData = [...prodRes.data].sort((a: any, b: any) =>
                    (a.line?.name || '').localeCompare(b.line?.name || '', undefined, { numeric: true, sensitivity: 'base' })
                );
                setData(sortedData);

                // Fetch cumulative summaries for all lots in the data
                const lotIds = Array.from(new Set(prodRes.data.flatMap((item: any) => {
                    const lots = item.lots && item.lots.length > 0 ? item.lots : [item.lot];
                    return lots.map((l: any) => l?.id).filter(Boolean);
                }))) as string[];

                if (lotIds.length > 0) {
                    const cumulativeRes = await ProductionService.getBulkSummary(lotIds);
                    if (cumulativeRes.status === 'success') {
                        setCumulativeSummaries(cumulativeRes.data);
                    }
                }
            }

            if (outputRes.status === 'success') {
                setProductionData(outputRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            await ProductivityService.delete(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const stylesInRange = data.flatMap(item => {
        const lots = item.lots && item.lots.length > 0 ? item.lots : [item.lot];
        return lots.map((l: any) => ({
            id: item.id,
            item_line_id: item.line_id,
            line: item.line?.name,
            gl: l.gl_group?.gl_number || 'N/A',
            lot_id: l.id,
            lot_code: (l.lot_code || '').replace(/^0+/, ''),
            target: l.pivot?.target_plan || item.target_plan || 0,
            smv: l.pivot?.smv || item.smv || 0,
            step: l.pivot?.last_step || item.last_step || 0,
            plan_mp: item.plan_manpower,
            actual_mp: item.manpower,
            sewer: item.sewer,
            hours: item.working_hour,
            total_order: l.gmt_qty || 0
        }));
    });

    return (
        <div className="max-w-[1600px] animate-in fade-in duration-700 p-4 pt-0">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-zinc-900 rounded-full"></div>
                        PERFORMANCE HUB
                    </h1>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1 ml-4">
                        Daily Productivity & Output Analytics
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 p-1.5 rounded-xl border border-zinc-100 shadow-sm">
                    <DatePicker
                        value={date}
                        onChange={(val) => setDate(val)}
                        className="w-[180px]"
                    />

                    <div className="h-4 w-[1px] bg-zinc-200 mx-1"></div>

                    <Button
                        onClick={() => router.push('/admin/productivity/create')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-4 h-9 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <Icon icon="solar:add-circle-bold" className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">New Entry</span>
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl w-fit mb-6 border border-zinc-200/50">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        activeTab === 'daily' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Icon icon="solar:ranking-bold-duotone" className="w-3.5 h-3.5" />
                    Daily List
                </button>
                <button
                    onClick={() => setActiveTab('target')}
                    className={cn(
                        "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        activeTab === 'target' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Icon icon="solar:target-bold-duotone" className="w-3.5 h-3.5" />
                    Style Report
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            {activeTab === 'daily' ? (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Line</th>
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">Buyer & Style</th>
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest">GL / Lot</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">MP (Act/Pln)</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Sewer</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">WH</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">SMV</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Target</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Output</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Achv</th>
                                    <th className="px-6 py-4 text-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">Bal</th>
                                    <th className="px-6 py-4 text-right text-[8px] font-black text-zinc-400 uppercase tracking-widest">Action</th>
                                </tr>
                            ) : (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[100px]">Line</th>
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[150px]">Buyer & Style</th>
                                    <th className="px-6 py-4 text-left text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[130px]">GL / Lot</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">MP Plan</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">Tgt Plan</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">MP Act</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center bg-zinc-50/50">Tgt Act</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">DO (Output)</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">Last Step</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center whitespace-nowrap">Diff L-Step</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center border-l border-zinc-100 whitespace-nowrap">Diff T.Act</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">% T.Act</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center border-l border-zinc-100 whitespace-nowrap">Diff T.Pln</th>
                                    <th className="px-4 py-4 text-[7px] font-black text-zinc-400 uppercase tracking-tighter text-center">% T.Pln</th>
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
                                    const lots = item.lots && item.lots.length > 0 ? item.lots : [item.lot];

                                    return lots.map((l: any, lIdx: number) => {
                                        // Calculate production output for this specific style ON THIS LINE
                                        // Safety: Use a Map to prevent double-counting if there are duplicate size entries for the same item
                                        const lineOutput = productionData
                                            .filter(p => p.line_id === item.line_id)
                                            .flatMap(p => p.items)
                                            .filter(pi => pi.lot_id === l.id)
                                            .reduce((sum, pi) => {
                                                const sizeMap = new Map<string, number>();
                                                pi.details?.forEach((d: any) => {
                                                    // Only take the last/unique entry for each size name per item
                                                    sizeMap.set(d.size_name, d.qty_output || 0);
                                                });
                                                return sum + Array.from(sizeMap.values()).reduce((s, v) => s + v, 0);
                                            }, 0);

                                        // Calculate total production output for this specific style ACROSS ALL TIME (Cumulative)
                                        const cumulativeOutput = Number(cumulativeSummaries[l.id]?.total_output || 0);

                                        const smv = l.pivot?.smv || item.smv || 0;
                                        const dailyTarget = smv > 0 ? Math.round(((item.manpower + item.sewer) * 8 * 60) / smv) : 0;
                                        const achieved = dailyTarget > 0 ? Math.round((lineOutput / dailyTarget) * 100) : 0;
                                        const miOrder = l.gmt_qty || 0;
                                        const balance = miOrder - cumulativeOutput;
                                        const lotCode = (l.lot_code || '').replace(/^0+/, '');
                                        const glNumber = l.gl_group?.gl_number || 'N/A';

                                        return (
                                            <tr key={`${item.id}-${l.id}-${lIdx}`} className={cn(
                                                "group hover:bg-zinc-50/50 transition-colors",
                                                lIdx > 0 ? "border-t border-zinc-50/30" : "border-t border-zinc-100 bg-zinc-50/10"
                                            )}>
                                                <td className="px-6 py-3">
                                                    {lIdx === 0 ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                                                                {item.line?.name.match(/\d+/)?.[0] || 'L'}
                                                            </div>
                                                            <span className="text-[11px] font-black text-zinc-900 tracking-tight">{item.line?.name}</span>
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-[11px] font-black text-zinc-900 uppercase truncate max-w-[150px]">{l.gl_group?.customer?.name || 'Unknown Buyer'}</span>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[150px]">{l.style_no || 'Unknown Style'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-zinc-700">{glNumber}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase">Lot: {lotCode}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {lIdx === 0 ? (
                                                        <span className="text-xs font-bold text-blue-600">
                                                            {item.manpower} <span className="text-zinc-300 mx-0.5 text-[9px]">/</span> <span className="text-zinc-400 font-medium">{item.plan_manpower || 0}</span>
                                                        </span>
                                                    ) : null}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {lIdx === 0 ? <span className="text-xs font-bold text-emerald-600">{item.sewer}</span> : null}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    {lIdx === 0 ? <span className="text-xs font-bold text-zinc-500">{item.working_hour}H</span> : null}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-[10px] font-black text-zinc-400">{smv}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-xs font-bold text-zinc-800 tabular-nums">{dailyTarget}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className="text-xs font-extrabold text-blue-600 tabular-nums">{lineOutput}</span>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase",
                                                        achieved >= 100 ? "bg-emerald-100 text-emerald-700" : achieved >= 80 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {achieved}%
                                                    </div>
                                                </td>
                                                <td className={cn(
                                                    "px-6 py-3 text-center text-[10px] font-bold tabular-nums",
                                                    balance > 0 ? "text-zinc-500" : "text-emerald-500"
                                                )}>
                                                    {balance}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {lIdx === 0 ? (
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => router.push(`/admin/productivity/edit/${item.id}`)} className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90">
                                                                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-zinc-100 text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90">
                                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        );
                                    });
                                })
                            ) : (
                                data.flatMap((item: any) => {
                                    const lots = item.lots && item.lots.length > 0 ? item.lots : [item.lot];

                                    return lots.map((l: any, lIdx: number) => {
                                        // 8. Output (DO)
                                        const lineOutput = productionData
                                            .filter(p => p.line_id === item.line_id)
                                            .flatMap(p => p.items)
                                            .filter(pi => pi.lot_id === l.id)
                                            .reduce((sum, pi) => {
                                                const sizeMap = new Map<string, number>();
                                                pi.details?.forEach((d: any) => {
                                                    sizeMap.set(d.size_name, d.qty_output || 0);
                                                });
                                                return sum + Array.from(sizeMap.values()).reduce((s, v) => s + v, 0);
                                            }, 0);

                                        // Variables
                                        const mpPlan = item.plan_manpower || 0;
                                        const targetPlan = l.pivot?.target_plan || 0;
                                        const mpActual = item.manpower + item.sewer;

                                        // 6. Target Actual ((Target Plan / MP plan) * MP actual))
                                        const targetActual = mpPlan > 0 ? Math.round((targetPlan / mpPlan) * mpActual) : 0;

                                        // 9. Last Step
                                        const lastStep = Number(l.pivot?.last_step || 0);

                                        // 10. DIFF DO VS Last Step (last step - DO)
                                        const diffDoLastStep = lastStep - lineOutput;

                                        // 11. DIFF DO vs Target Actual (DO - target actual)
                                        const diffDoTargetActual = lineOutput - targetActual;

                                        // 12. Percentage (DO / target actual * 100%)
                                        const pctTargetActual = targetActual > 0 ? Math.round((lineOutput / targetActual) * 100) : 0;

                                        // 13. DIFF DO vs Target Plan (DO - target plan)
                                        const diffDoTargetPlan = lineOutput - targetPlan;

                                        // 14. Percentage (DO / target plan * 100%)
                                        const pctTargetPlan = targetPlan > 0 ? Math.round((lineOutput / targetPlan) * 100) : 0;

                                        const glNumber = l.gl_group?.gl_number || 'N/A';
                                        const lotCode = (l.lot_code || '').replace(/^0+/, '');

                                        return (
                                            <tr key={`${item.id}-${l.id}-report`} className="group hover:bg-zinc-50/50 transition-colors border-t border-zinc-100">
                                                <td className="px-6 py-3">
                                                    <span className="text-[10px] font-black text-zinc-900">{item.line?.name}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-[10px] font-black text-zinc-900 uppercase truncate max-w-[120px]">{l.gl_group?.customer?.name || 'Unknown Buyer'}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">{l.style_no || 'Unknown Style'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-zinc-700">{glNumber}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase">Lot: {lotCode}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-xs font-bold text-zinc-500 tabular-nums">{mpPlan}</td>
                                                <td className="px-4 py-3 text-center text-xs font-bold text-zinc-500 tabular-nums">{targetPlan}</td>
                                                <td className="px-4 py-3 text-center text-xs font-black text-blue-600 tabular-nums">{mpActual}</td>
                                                <td className="px-4 py-3 text-center text-xs font-black text-zinc-900 tabular-nums bg-zinc-50/30">{targetActual}</td>
                                                <td className="px-4 py-3 text-center text-xs font-black text-emerald-600 tabular-nums">{lineOutput}</td>
                                                <td className="px-4 py-3 text-center text-xs font-bold text-zinc-500 tabular-nums">{lastStep}</td>
                                                <td className={cn("px-4 py-3 text-center text-[10px] font-black tabular-nums whitespace-nowrap", diffDoLastStep > 0 ? "text-amber-600" : "text-emerald-600")}>
                                                    {diffDoLastStep}
                                                </td>
                                                <td className={cn("px-4 py-3 text-center text-[10px] font-black tabular-nums border-l border-zinc-50 whitespace-nowrap", diffDoTargetActual >= 0 ? "text-emerald-600" : "text-red-500")}>
                                                    {diffDoTargetActual > 0 ? `+${diffDoTargetActual}` : diffDoTargetActual}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={cn(
                                                        "inline-block px-1.5 py-0.5 rounded text-[8px] font-black",
                                                        pctTargetActual >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-500"
                                                    )}>
                                                        {pctTargetActual}%
                                                    </span>
                                                </td>
                                                <td className={cn("px-4 py-3 text-center text-[10px] font-black tabular-nums border-l border-zinc-50 whitespace-nowrap", diffDoTargetPlan >= 0 ? "text-emerald-600" : "text-red-500")}>
                                                    {diffDoTargetPlan > 0 ? `+${diffDoTargetPlan}` : diffDoTargetPlan}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={cn(
                                                        "inline-block px-1.5 py-0.5 rounded text-[8px] font-black",
                                                        pctTargetPlan >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                                                    )}>
                                                        {pctTargetPlan}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Stats Footer */}
            {activeTab === 'daily' && data.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 relative z-10">Lines</p>
                        <p className="text-xl font-black text-zinc-900 relative z-10">{data.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 relative z-10">Actual MP</p>
                        <p className="text-xl font-black text-emerald-600 relative z-10">{data.reduce((sum, i) => sum + i.manpower, 0)}</p>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-xl col-span-2 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Health Signal</p>
                            <p className="text-xs font-bold text-white/90">MP Utilization: {Math.round((data.reduce((s, i) => s + i.manpower, 0) / (data.reduce((s, i) => s + (i.plan_manpower || 1), 0) || 1)) * 100)}%</p>
                        </div>
                        <Icon icon="solar:shield-check-bold-duotone" className="w-8 h-8 text-emerald-400 relative z-10" />
                    </div>
                </div>
            )}
        </div>
    );
};
