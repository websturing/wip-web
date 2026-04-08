'use client';

import { Dialog, DialogContent } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

interface GlSummaryDialogProps {
    glGroupId: string | null;
    onClose: () => void;
}

export const GlSummaryDialog = ({ glGroupId, onClose }: GlSummaryDialogProps) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (glGroupId) {
            fetchSummary();
        }
    }, [glGroupId]);

    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const result = await ReferenceService.getGlSummary(glGroupId!);
            if (result.status === 'success') {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!glGroupId) return null;

    const percentage = data ? Math.min(Math.round((data.summary.total_output / data.summary.total_order) * 100), 100) : 0;

    return (
        <Dialog open={!!glGroupId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-white border-zinc-200 text-zinc-900 p-0 overflow-hidden rounded-[2.5rem]">
                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">GATHERING ANALYTICS...</span>
                    </div>
                ) : data ? (
                    <div className="flex flex-col h-full bg-zinc-50/30">
                        {/* Header Section */}
                        <div className="p-8 bg-zinc-900 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                        <span className="text-[10px] font-black tracking-widest uppercase">GL ANALYSIS</span>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/20">
                                        <span className="text-[10px] font-black tracking-widest uppercase">REAL-TIME DATA</span>
                                    </div>
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic">{data.gl_info.gl_number}</h2>
                                <p className="text-white/50 text-xs font-bold mt-1 tracking-widest uppercase">{data.gl_info.customer}</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Stats Cards */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Comparison Chart */}
                                <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Production Progress</h3>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Comparison: Reference vs Output</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-blue-600">{percentage}%</span>
                                        </div>
                                    </div>

                                    <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden mb-8">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]"></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Order Reference</span>
                                            </div>
                                            <p className="text-xl font-black text-zinc-900">{data.summary.total_order.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Total Output</span>
                                            </div>
                                            <p className="text-xl font-black text-blue-600">{data.summary.total_output.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Color & Size Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Output by Color</h4>
                                        <div className="space-y-4">
                                            {data.breakdown.by_color.map((c: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                                        <span className="text-zinc-600">{c.name}</span>
                                                        <span className="text-zinc-900">{c.qty.toLocaleString()}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-zinc-50 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-zinc-900 rounded-full"
                                                            style={{ width: `${(c.qty / data.summary.total_output) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Output by Size</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {data.breakdown.by_size.map((s: any, i: number) => (
                                                <div key={i} className="px-4 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col min-w-[80px]">
                                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">{s.name}</span>
                                                    <span className="text-sm font-black text-zinc-900">{s.qty.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lot List Section */}
                            <div className="bg-zinc-900 rounded-[2.5rem] p-6 text-white h-[500px] flex flex-col shadow-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Associated Lots ({data.summary.lots_count})</h4>
                                    <Icon icon="solar:layers-bold-duotone" className="w-5 h-5 text-white/20" />
                                </div>
                                <div className="space-y-3 overflow-y-auto no-scrollbar relative z-10 flex-1">
                                    {data.lots_details.map((lot: any, i: number) => (
                                        <div key={i} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black">LOT {lot.lot_number}</span>
                                                <span className="text-xs font-black text-blue-400">{lot.order_qty.toLocaleString()} <span className="text-[8px] opacity-50 uppercase ml-0.5">PCS</span></span>
                                            </div>
                                            <p className="text-[10px] font-bold text-white/50 truncate">STYLE: {lot.style_no || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => onClose()} className="mt-6 w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors relative z-10">
                                    Close Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
            <style jsx>{`
                @keyframes progress {
                    0% { background-position: 0 0; }
                    100% { background-position: 20px 20px; }
                }
            `}</style>
        </Dialog>
    );
};
