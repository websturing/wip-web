'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useIeLayout } from '../hooks/useIeLayout';

interface IeLayoutListProps {
    onEdit: (layout: any) => void;
    onManpowerClick: (layout: any) => void;
}

export const IeLayoutList = ({ onEdit, onManpowerClick }: IeLayoutListProps) => {
    const { data, isLoading, error, deleteLayout } = useIeLayout();
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

    if (isLoading) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Loading IE Ecosystem...</span>
        </div>
    );

    if (error) return (
        <div className="m-10 p-12 text-center bg-red-50 text-red-600 rounded-[2rem] border border-red-100">
            <Icon icon="solar:danger-bold-duotone" className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm font-black uppercase tracking-widest">Architectural Error</p>
            <p className="text-xs font-bold mt-2 opacity-70">{error.message}</p>
        </div>
    );

    return (
        <div className="px-10 pb-20">
            {/* View Toggle */}
            <div className="flex justify-end mb-8">
                <div className="bg-white border border-zinc-100 p-1.5 rounded-[1.5rem] flex items-center gap-1.5 shadow-xl shadow-zinc-200/50">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            viewMode === 'list' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-50"
                        )}
                    >
                        <Icon icon="solar:list-bold-duotone" className="w-4 h-4" />
                        <span>List View</span>
                    </button>
                    <button
                        onClick={() => setViewMode('card')}
                        className={cn(
                            "px-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            viewMode === 'card' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:bg-zinc-50"
                        )}
                    >
                        <Icon icon="solar:widget-2-bold-duotone" className="w-4 h-4" />
                        <span>Card View</span>
                    </button>
                </div>
            </div>

            <div className={cn(
                "grid gap-8",
                viewMode === 'list' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            )}>
                {data?.length > 0 ? (
                    viewMode === 'list' ? (
                        /* Premium Table-Style List */
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Layout Module</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Stats</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Daily MP</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Assigned GL</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {data.map((layout, i) => (
                                        <tr
                                            key={layout.id}
                                            className="group hover:bg-zinc-50/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                                            style={{ animationDelay: `${i * 50}ms` }}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-all duration-500">
                                                        <Icon icon="solar:programming-bold-duotone" className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-zinc-900 leading-none mb-1 lowercase">{layout.name}</p>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 px-1.5 py-0.5 bg-zinc-100 rounded">
                                                            {layout.department || 'sewing'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-zinc-300 uppercase leading-none mb-1">SMV</span>
                                                        <span className="text-sm font-black text-zinc-900">{(layout.total_smv || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-zinc-300 uppercase leading-none mb-1">Process</span>
                                                        <span className="text-sm font-black text-zinc-900">{layout.details?.length || 0}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-black text-zinc-900">
                                                        {(layout.man_power_sewer || 0) +
                                                            (layout.man_power_matching || 0) +
                                                            (layout.man_power_qc || 0) +
                                                            (layout.man_power_others || 0)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {layout.gl_number ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest italic border border-blue-100/50">
                                                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                                                        {layout.gl_number}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic">Not Linked</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => onManpowerClick(layout)}
                                                        className="w-10 h-10 bg-white text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl border border-zinc-100 transition-all flex items-center justify-center group/mp shadow-sm"
                                                        title="Daily Manpower"
                                                    >
                                                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-5 h-5 group-hover/mp:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(layout)}
                                                        className="h-10 px-4 bg-zinc-900 hover:bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-zinc-200"
                                                    >
                                                        <Icon icon="solar:tuning-2-bold-duotone" className="w-4 h-4" />
                                                        <span>Optimize</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { if (confirm('Archive?')) deleteLayout(layout.id); }}
                                                        className="w-10 h-10 bg-white text-zinc-200 hover:bg-red-50 hover:text-red-500 rounded-xl border border-zinc-100 transition-all flex items-center justify-center group/del shadow-sm"
                                                    >
                                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Card View */
                        data.map((layout, i) => (
                            <div
                                key={layout.id}
                                className="group relative bg-white border border-zinc-100 transition-all duration-700 overflow-hidden animate-in fade-in slide-in-from-bottom-8 rounded-[3rem] p-10 hover:shadow-2xl hover:shadow-zinc-200/50 hover:-translate-y-2"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {/* ... existing card content ... */}
                                <div className="absolute right-10 top-10 flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">LIVE DATA</span>
                                </div>

                                <div className="mb-10 block">
                                    <div className="bg-zinc-900 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-zinc-200 w-16 h-16 mb-6">
                                        <Icon icon="solar:programming-bold-duotone" className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight lowercase">
                                        {layout.name}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full text-[8px] font-black uppercase tracking-widest leading-none">
                                            {layout.department || 'sewing'}
                                        </span>
                                        <span className="text-zinc-200 font-bold text-[10px]">/</span>
                                        <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-tighter">#{layout.id}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-12">
                                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 transition-all hover:bg-white hover:border-blue-50">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1 opacity-60">Process</span>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="solar:layers-bold-duotone" className="w-3.5 h-3.5 text-zinc-900" />
                                            <span className="text-lg font-black text-zinc-900">{layout.details?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 transition-all hover:bg-white hover:border-blue-50">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1 opacity-60">Total SMV</span>
                                        <div className="flex items-center gap-2 text-zinc-900">
                                            <Icon icon="solar:stopwatch-bold-duotone" className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-lg font-black">{(layout.total_smv || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 transition-all hover:bg-white hover:border-blue-50">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1 opacity-60">Workers</span>
                                        <div className="flex items-center gap-2 text-zinc-900">
                                            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-lg font-black">
                                                {(layout.man_power_sewer || 0) +
                                                    (layout.man_power_matching || 0) +
                                                    (layout.man_power_qc || 0) +
                                                    (layout.man_power_others || 0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 transition-all hover:bg-white hover:border-blue-50">
                                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-1 opacity-60">GL Link</span>
                                        <div className="flex items-center gap-2 text-zinc-900">
                                            <Icon icon="solar:verified-check-bold-duotone" className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-[10px] font-black text-blue-900 uppercase italic truncate">{layout.gl_number || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full">
                                    <Button
                                        onClick={() => onEdit(layout)}
                                        title="Optimize Architecture"
                                        className="h-14 flex-1 bg-zinc-900 hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Icon icon="solar:pen-new-square-bold-duotone" className="w-4 h-4" />
                                        <span>Optimization</span>
                                    </Button>
                                    <button
                                        onClick={() => onManpowerClick(layout)}
                                        title="Daily Manpower Tracking"
                                        className="h-14 w-14 bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl border border-blue-100 flex items-center justify-center transition-all group/mp shadow-lg shadow-blue-500/10"
                                    >
                                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-5 h-5 group-hover/mp:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Archive this layout module?')) deleteLayout(layout.id);
                                        }}
                                        title="Archive Layout"
                                        className="h-14 w-14 bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 rounded-2xl border border-zinc-100 flex items-center justify-center transition-all group/del"
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5 group-hover/del:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center bg-zinc-50/50 rounded-[4rem] border border-dashed border-zinc-200 m-10">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-zinc-200 flex items-center justify-center text-zinc-100 mb-8 border border-zinc-100 group-hover:scale-110 transition-transform">
                            <Icon icon="solar:ghost-bold-duotone" className="w-12 h-12" />
                        </div>
                        <h4 className="text-xl font-black text-zinc-900 uppercase tracking-widest mb-2">Zero Layout Found</h4>
                        <p className="text-zinc-400 text-xs font-bold font-mono tracking-tighter">Initialize first IE layout to start analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
