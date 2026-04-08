'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProduction } from '../hooks/useProduction';
import { ProductionService } from '../services/ProductionService';

export const Production = () => {
    const router = useRouter();
    const { data: productions, isLoading, refresh } = useProduction();
    const [lines, setLines] = useState<any[]>([]);

    useEffect(() => {
        ProductionService.getLines().then(res => {
            if (res && res.status === 'success') {
                setLines(res.data || []);
            }
        }).catch(err => {
            console.error('Lines fetch error:', err);
            setLines([]);
        });
    }, []);

    if (isLoading) return (
        <div className="p-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
                        <Icon icon="solar:chart-2-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Production Log</h2>
                        <p className="text-zinc-500 text-xs font-medium">Monitoring daily assembly progress</p>
                    </div>
                </div>

                <Button
                    onClick={() => router.push('/admin/production/create')}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-12 flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
                    <span>Create Production Log</span>
                </Button>
            </div>

            {/* Production List (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(productions || []).length === 0 ? (
                    <div className="col-span-full py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-12 h-12 opacity-20 mb-4" />
                        <p className="text-sm font-medium">No production logs found for today.</p>
                        <p className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-50">Start by creating a new log</p>
                    </div>
                ) : (
                    (productions || []).map((p: any, idx: number) => (
                        <div key={idx} className="group bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-100">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{p.line?.name || 'Line'}</span>
                                </div>
                                <span className="text-zinc-400 text-[10px] font-bold">{p.production_date}</span>
                            </div>

                            <div className="space-y-4">
                                {(p.items || []).map((item: any, iIdx: number) => (
                                    <div key={iIdx} className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-sm text-zinc-900">{item.lot?.lot_code || 'Unknown Lot'}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{item.color}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-tighter">
                                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                                <span className="text-zinc-400">Total Input</span>
                                                <span className="text-zinc-900">{(item.details || []).reduce((acc: number, s: any) => acc + (s.qty_input || 0), 0)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                                <span className="text-zinc-400">Total Output</span>
                                                <span className="text-blue-600">{(item.details || []).reduce((acc: number, s: any) => acc + (s.qty_output || 0), 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Entry By</span>
                                    <span className="text-[11px] font-bold text-zinc-700">{p.creator?.name || 'Administrator'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                                        <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this log?')) {
                                                await ProductionService.delete(p.id);
                                                refresh();
                                            }
                                        }}
                                        className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
