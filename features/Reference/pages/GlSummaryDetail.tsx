'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const GlSummaryDetail = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSummary();
        }
    }, [id]);

    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const result = await ReferenceService.getGlSummary(id);
            if (result.status === 'success') {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Loading Deep Analytics...</span>
        </div>
    );

    if (!data) return null;

    const percentage = Math.min(Math.round((data.summary.total_output / data.summary.total_order) * 100), 100);

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-12">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-all font-bold"
                >
                    <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <Icon icon="solar:alt-arrow-left-linear" className="w-4 h-4" />
                    </div>
                    <span>Back to Reference</span>
                </Button>

                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                        Live Data Matrix
                    </span>
                    <span className="px-4 py-1.5 bg-zinc-100 text-zinc-500 rounded-full border border-zinc-200 text-[10px] font-black uppercase tracking-widest">
                        Ref: {data.gl_info.gl_number}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Summary & Progress */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Main Title Card */}
                    <div className="bg-zinc-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none mb-4">{data.gl_info.gl_number}</h1>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <Icon icon="solar:user-bold-duotone" className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Customer Partner</p>
                                    <p className="text-xl font-black">{data.gl_info.customer}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completion Matrix */}
                    <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-xl shadow-zinc-200/50">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Production Accuracy</h3>
                                <p className="text-sm font-medium text-zinc-400 mt-1">Order Fulfillment vs Actual Production</p>
                            </div>
                            <div className="text-right">
                                <span className={cn(
                                    "text-5xl font-black",
                                    percentage >= 100 ? "text-emerald-500" : "text-blue-600"
                                )}>{percentage}%</span>
                            </div>
                        </div>

                        <div className="relative h-6 bg-zinc-100 rounded-full overflow-hidden mb-12 shadow-inner">
                            <div
                                className={cn(
                                    "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
                                    percentage >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                                )}
                                style={{ width: `${percentage}%` }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-[progress_1s_linear_infinite]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 hover:border-zinc-200 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:notebook-bold-duotone" className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Order</span>
                                </div>
                                <p className="text-3xl font-black text-zinc-900">{data.summary.total_order.toLocaleString()}</p>
                            </div>

                            <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50 hover:border-blue-200 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Produced</span>
                                </div>
                                <p className="text-3xl font-black text-blue-600">{data.summary.total_output.toLocaleString()}</p>
                            </div>

                            <div className="bg-amber-50/30 p-6 rounded-[2rem] border border-amber-100/50 hover:border-amber-200 transition-all group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Icon icon="solar:chart-2-bold-duotone" className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Remaining</span>
                                </div>
                                <p className="text-3xl font-black text-amber-600">{Math.max(0, data.summary.total_order - data.summary.total_output).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Breakdown by Color */}
                        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-8 border-l-4 border-zinc-900 pl-4">Color Distribution</h4>
                            <div className="space-y-6">
                                {data.breakdown.by_color.map((c: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-zinc-600 uppercase tracking-tight">{c.name}</span>
                                            <span className="text-xs font-black text-zinc-900">{c.qty.toLocaleString()} PCS</span>
                                        </div>
                                        <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-zinc-900 rounded-full"
                                                style={{ width: `${(c.qty / data.summary.total_output) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Breakdown by Size */}
                        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-8 border-l-4 border-blue-600 pl-4">Size Matrix</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {data.breakdown.by_size.map((s: any, i: number) => (
                                    <div key={i} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:bg-white hover:shadow-lg transition-all">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{s.name}</span>
                                        <p className="text-xl font-black text-zinc-900 mt-1">{s.qty.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Associated Lots */}
                <div className="lg:col-span-4 h-full">
                    <div className="bg-zinc-900 rounded-[3rem] p-10 text-white sticky top-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <h4 className="text-sm font-black text-white/40 uppercase tracking-widest">Associated Lots</h4>
                            <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black">{data.summary.lots_count}</div>
                        </div>
                        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto no-scrollbar pr-2">
                            {data.lots_details.map((lot: any, i: number) => (
                                <div key={i} className="p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[2rem] transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-blue-600 transition-colors">
                                            {lot.lot_number}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Lot Ref</p>
                                            <p className="text-lg font-black text-blue-400 italic leading-none">{lot.order_qty.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/5 w-full mb-4"></div>
                                    <div className="flex items-center gap-2">
                                        <Icon icon="solar:tag-bold-duotone" className="w-3.5 h-3.5 text-white/20" />
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Style: {lot.style_no || 'NOT SET'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 p-6 bg-blue-600 rounded-[2rem] text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Sync Progress</p>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-black">{percentage}%</span>
                                <span className="text-[10px] font-bold uppercase opacity-80">COMPLETE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { background-position: 0 0; }
                    100% { background-position: 30px 30px; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
