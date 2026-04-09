'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductivityService } from '../services/ProductivityService';

export const Productivity = () => {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await ProductivityService.getAll(date);
            if (res.status === 'success') {
                setData(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch productivity:', error);
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

    return (
        <div className="p-10 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                        FACILITY PERFORMANCE
                    </h1>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1 ml-4">
                        Daily Efficiency Analytics & Metrics
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                    <div className="relative">
                        <Icon icon="solar:calendar-linear" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 h-11 text-xs font-bold outline-none cursor-pointer hover:border-zinc-900 transition-all"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-zinc-200 mx-1"></div>

                    <Button
                        onClick={() => router.push('/admin/productivity/create')}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-11 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
                    >
                        <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Record Entry</span>
                    </Button>
                </div>
            </div>

            {/* Compact Table */}
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-8 py-5 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Line</th>
                            <th className="px-8 py-5 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Style Reference</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Manpower (A/P)</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Hours</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Target</th>
                            <th className="px-8 py-5 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">SMV / L-STEP</th>
                            <th className="px-8 py-5 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-32 text-center text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">Synchronizing data...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-12 h-12" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No entries found for this date</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-sm">
                                                {item.line?.name.match(/\d+/)?.[0] || 'L'}
                                            </div>
                                            <span className="text-xs font-bold text-zinc-900">{item.line?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col gap-2">
                                            {(item.lots && item.lots.length > 0 ? item.lots : [item.lot]).map((l: any, idx: number) => l && (
                                                <div key={l.id || idx} className="flex flex-col">
                                                    <span className="text-xs font-black text-zinc-700">{l.gl_group?.gl_number || 'N/A'}</span>
                                                    <span className="text-[9px] font-medium text-zinc-400 uppercase">Lot: {(l.lot_code || '').replace(/^0+/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex items-baseline justify-center gap-1.5">
                                            <span className="text-sm font-black text-zinc-900">{item.manpower}</span>
                                            <span className="text-[9px] font-bold text-zinc-300 italic">of</span>
                                            <span className="text-[11px] font-bold text-zinc-400">{item.plan_manpower || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="text-sm font-bold text-zinc-900">{item.working_hour}</span>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex flex-col gap-2 items-center">
                                            {item.lots && item.lots.length > 0 ? (
                                                item.lots.map((l: any) => (
                                                    <div key={l.id} className="px-3 py-0.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100 min-w-[60px]">
                                                        <span className="text-[10px] font-black tracking-tight">{l.pivot?.target_plan || 0}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
                                                    <span className="text-xs font-black tracking-tight">{item.target_plan || 0}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex flex-col gap-3">
                                            {(item.lots && item.lots.length > 0 ? item.lots : []).map((l: any) => (
                                                <div key={l.id} className="flex items-center justify-center gap-4 border-b border-zinc-50 pb-1 last:border-0 last:pb-0">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-bold text-blue-600">{l.pivot?.smv}</span>
                                                        <span className="text-[7px] font-black text-zinc-300 uppercase">SMV</span>
                                                    </div>
                                                    <div className="h-4 w-[1px] bg-zinc-100"></div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[10px] font-bold text-emerald-600">{l.pivot?.last_step}</span>
                                                        <span className="text-[7px] font-black text-zinc-300 uppercase">Step</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!item.lots || item.lots.length === 0) && (
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[11px] font-bold text-blue-600">{item.smv}</span>
                                                        <span className="text-[7px] font-black text-zinc-300 uppercase">SMV</span>
                                                    </div>
                                                    <div className="h-4 w-[1px] bg-zinc-100"></div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[11px] font-bold text-emerald-600">{item.last_step}</span>
                                                        <span className="text-[7px] font-black text-zinc-300 uppercase">Step</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => router.push(`/admin/productivity/edit/${item.id}`)}
                                                className="w-8 h-8 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90"
                                            >
                                                <Icon icon="solar:pen-linear" className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-8 h-8 rounded-lg border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:border-red-200 transition-all active:scale-90"
                                            >
                                                <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Condensed Footer Info */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Active Lines</p>
                    <p className="text-xl font-black text-zinc-900">{data.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Manpower</p>
                    <p className="text-xl font-black text-emerald-500">{data.reduce((sum, i) => sum + i.manpower, 0)}</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl col-span-2 flex items-center justify-between text-white">
                    <div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Operational Health</p>
                        <p className="text-sm font-bold">Synchronized with Production Hub</p>
                    </div>
                    <Icon icon="solar:shield-check-bold-duotone" className="w-8 h-8 text-emerald-400" />
                </div>
            </div>
        </div>
    );
};
