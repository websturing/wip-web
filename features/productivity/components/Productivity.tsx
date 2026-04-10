'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductivityService } from '../services/ProductivityService';

export const Productivity = () => {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'target'>('daily');

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

    const stylesInRange = data.flatMap(item => {
        const lots = item.lots && item.lots.length > 0 ? item.lots : [item.lot];
        return lots.map((l: any) => ({
            id: item.id,
            line: item.line?.name,
            gl: l.gl_group?.gl_number || 'N/A',
            lot_code: (l.lot_code || '').replace(/^0+/, ''),
            target: l.pivot?.target_plan || item.target_plan || 0,
            smv: l.pivot?.smv || item.smv || 0,
            step: l.pivot?.last_step || item.last_step || 0,
            plan_mp: item.plan_manpower,
            actual_mp: item.manpower,
            hours: item.working_hour
        }));
    });

    return (
        <div className="max-w-[1500px] animate-in fade-in duration-700 pt-0">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                        PERFORMANCE HUB
                    </h1>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-1 ml-4">
                        Analytics & Resource Management
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-2xl border border-zinc-100 shadow-sm">
                    <div className="relative">
                        <Icon icon="solar:calendar-linear" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 h-11 text-xs font-bold outline-none cursor-pointer hover:border-zinc-900 transition-all font-mono"
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

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl w-fit mb-8 border border-zinc-200/50">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={cn(
                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        activeTab === 'daily' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Icon icon="solar:ranking-bold-duotone" className="w-4 h-4" />
                    Daily Productivity
                </button>
                <button
                    onClick={() => setActiveTab('target')}
                    className={cn(
                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        activeTab === 'target' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    )}
                >
                    <Icon icon="solar:target-bold-duotone" className="w-4 h-4" />
                    Target Output Sewing
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-[0_2px_40px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            {activeTab === 'daily' ? (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-10 py-6 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Line Orientation</th>
                                    <th className="px-10 py-6 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Style Queue</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Actual / Plan MP</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Work Hours</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Total Lot Target</th>
                                    <th className="px-10 py-6 text-right text-[9px] font-black text-zinc-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            ) : (
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-10 py-6 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">Line</th>
                                    <th className="px-10 py-6 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">GL / Style</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">SMV</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Step</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Planned MP</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">Target (PCS)</th>
                                    <th className="px-10 py-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">PCS / Hour</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={activeTab === 'daily' ? 6 : 7} className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Synchronizing...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'daily' ? 6 : 7} className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-10">
                                            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-16 h-16" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Intelligence Data Available</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : activeTab === 'daily' ? (
                                data.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50/30 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:rotate-6 transition-transform">
                                                    {item.line?.name.match(/\d+/)?.[0] || 'L'}
                                                </div>
                                                <span className="text-xs font-black text-zinc-900 tracking-tight">{item.line?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-wrap gap-2">
                                                {(item.lots && item.lots.length > 0 ? item.lots : [item.lot]).map((l: any, idx: number) => l && (
                                                    <div key={l.id || idx} className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl">
                                                        <span className="text-[10px] font-black text-zinc-600">{l.gl_group?.gl_number}</span>
                                                        <div className="w-[1px] h-3 bg-zinc-200"></div>
                                                        <span className="text-[10px] font-bold text-zinc-400">#{(l.lot_code || '').replace(/^0+/, '')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <div className="inline-flex items-baseline gap-2 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100">
                                                <span className="text-base font-black text-blue-700">{item.manpower}</span>
                                                <span className="text-[10px] font-bold text-blue-300">/</span>
                                                <span className="text-xs font-bold text-blue-400">{item.plan_manpower || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-xs font-black text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg">{item.working_hour}h</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-sm font-black text-purple-600 tabular-nums">
                                                {(item.lots || []).reduce((sum: number, l: any) => sum + (l.pivot?.target_plan || 0), 0) || item.target_plan || 0}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => router.push(`/admin/productivity/edit/${item.id}`)} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:border-blue-100 hover:shadow-sm transition-all active:scale-90">
                                                    <Icon icon="solar:pen-bold-duotone" className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-100 hover:shadow-sm transition-all active:scale-90">
                                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                stylesInRange.map((style, idx) => (
                                    <tr key={idx} className="group hover:bg-zinc-50/30 transition-colors">
                                        <td className="px-10 py-6">
                                            <span className="text-xs font-black text-zinc-900">{style.line}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-zinc-700">{style.gl}</span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Lot: {style.lot_code}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-xs font-bold text-blue-600">{style.smv}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-xs font-bold text-emerald-600">{style.step}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-xs font-bold text-zinc-400">{style.plan_mp}</span>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <div className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-xl border border-purple-100 inline-block">
                                                <span className="text-xs font-black tabular-nums">{style.target}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="text-xs font-black text-zinc-900">
                                                {style.hours > 0 ? Math.round(style.target / style.hours) : '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Global Stats Footer */}
            {activeTab === 'daily' && data.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-7 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-zinc-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform"></div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 relative z-10">Active Lines</p>
                        <p className="text-3xl font-black text-zinc-900 relative z-10">{data.length}</p>
                    </div>
                    <div className="bg-white p-7 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform"></div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 relative z-10">Total Actual MP</p>
                        <p className="text-3xl font-black text-emerald-600 relative z-10">{data.reduce((sum, i) => sum + i.manpower, 0)}</p>
                    </div>
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] col-span-2 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Facility Health Signal</p>
                            <p className="text-base font-bold text-white/90">Manpower Utilization: {Math.round((data.reduce((s, i) => s + i.manpower, 0) / (data.reduce((s, i) => s + (i.plan_manpower || 1), 0) || 1)) * 100)}%</p>
                        </div>
                        <Icon icon="solar:shield-check-bold-duotone" className="w-12 h-12 text-emerald-400 relative z-10" />
                    </div>
                </div>
            )}
        </div>
    );
};
