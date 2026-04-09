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
    const [lotSearch, setLotSearch] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
                {/* Left Side: Analytics & Progress */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Main Title Card */}
                    <div className="bg-zinc-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 min-h-[300px] flex flex-col justify-center">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-none mb-6">{data.gl_info.gl_number}</h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl">
                                        <Icon icon="solar:user-bold-duotone" className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Customer Partner</p>
                                        <p className="text-xl font-black">{data.gl_info.customer}</p>
                                    </div>
                                </div>
                                <div className="h-10 w-px bg-white/10 hidden md:block" />
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl">
                                        <Icon icon="solar:box-bold-duotone" className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Total Associated Lots</p>
                                        <p className="text-xl font-black text-emerald-400">{data.summary.lots_count}</p>
                                    </div>
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

                        <div className="relative h-6 bg-zinc-100 rounded-full overflow-hidden mb-4 shadow-inner">
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
                        <div className="text-right">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Last Synced Data Matrix • Live</span>
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

                {/* Right Side: Key Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 h-fit sticky top-8">
                        <div className="flex items-baseline justify-between mb-10">
                            <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Key Performance</h4>
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Health OK</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 transition-all hover:bg-white hover:shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Icon icon="solar:notebook-bold-duotone" className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Order</span>
                                </div>
                                <p className="text-4xl font-black text-zinc-900 tracking-tighter">{data.summary.total_order.toLocaleString()}</p>
                                <span className="text-[10px] font-bold text-zinc-400 mt-2 block uppercase tracking-tight italic">Units across all lots</span>
                            </div>

                            <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 transition-all hover:bg-white hover:shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Produced Qty</span>
                                </div>
                                <p className="text-4xl font-black text-blue-600 tracking-tighter">{data.summary.total_output.toLocaleString()}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600">{percentage}%</span>
                                </div>
                            </div>

                            <div className="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100/50 transition-all hover:bg-white hover:shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Icon icon="solar:chart-2-bold-duotone" className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">WIP / Remaining</span>
                                </div>
                                <p className="text-4xl font-black text-amber-600 tracking-tighter">{Math.max(0, data.summary.total_order - data.summary.total_output).toLocaleString()}</p>
                                <span className="text-[10px] font-bold text-amber-500 mt-2 block uppercase tracking-tight">Pending fulfillment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Associated Lots Repository */}
            <div className="mt-10 mb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
                            Associated Lots Explorer
                            <span className="bg-zinc-100 text-zinc-400 px-3 py-1 rounded-xl text-xs font-black">{data.summary.lots_count} Lots</span>
                        </h3>
                        <p className="text-sm font-medium text-zinc-400 mt-1">Manage and track specific production batches for this GL</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                            <button
                                onClick={() => setViewMode('card')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    viewMode === 'card' ? "bg-white shadow-md text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:widget-5-bold-duotone" className="w-4 h-4" />
                                <span>Grid view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    viewMode === 'table' ? "bg-white shadow-md text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:list-bold-duotone" className="w-4 h-4" />
                                <span>List view</span>
                            </button>
                        </div>

                        <div className="relative group min-w-[320px]">
                            <Icon icon="solar:magnifer-linear" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by lot number or style..."
                                className="w-full bg-white border border-zinc-200 h-14 rounded-2xl pl-14 pr-6 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                onChange={(e) => setLotSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {data.lots_details
                            .filter((l: any) =>
                                !lotSearch ||
                                l.lot_number.toLowerCase().includes(lotSearch.toLowerCase()) ||
                                (l.style_no && l.style_no.toLowerCase().includes(lotSearch.toLowerCase()))
                            )
                            .map((lot: any, i: number) => (
                                <div key={i} className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl text-white flex flex-col items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                                            <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">LOT</span>
                                            <span className="text-xl font-black leading-none">{lot.lot_number}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Order Qty</p>
                                            <p className="text-2xl font-black text-zinc-900 tracking-tight italic leading-none">{lot.order_qty.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 transition-colors group-hover:bg-zinc-100/50">
                                            <div className="flex items-center gap-3 mb-1">
                                                <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-zinc-300" />
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Style Reference</span>
                                            </div>
                                            <p className="text-xs font-black text-zinc-900 truncate uppercase tracking-tight">
                                                {lot.style_no || 'STYLE UNSET'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Synchronized</span>
                                            </div>
                                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">Lot Ref</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">Style Code</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">Order Quantity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-50 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {data.lots_details
                                    .filter((l: any) =>
                                        !lotSearch ||
                                        l.lot_number.toLowerCase().includes(lotSearch.toLowerCase()) ||
                                        (l.style_no && l.style_no.toLowerCase().includes(lotSearch.toLowerCase()))
                                    )
                                    .map((lot: any, i: number) => (
                                        <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl text-white flex items-center justify-center font-black text-xs">
                                                        {lot.lot_number}
                                                    </div>
                                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest italic ml-2">Lot Reference</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="text-xs font-black text-zinc-900 border-b-2 border-zinc-100 pb-0.5">
                                                    {lot.style_no || 'NONE'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="solar:database-bold-duotone" className="w-4 h-4 text-zinc-300" />
                                                    <span className="text-sm font-black text-zinc-900">{lot.order_qty.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase italic ml-1">PCS</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synchronized</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest decoration-2 underline-offset-4 hover:underline transition-all">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {data.lots_details.filter((l: any) =>
                    !lotSearch ||
                    l.lot_number.toLowerCase().includes(lotSearch.toLowerCase()) ||
                    (l.style_no && l.style_no.toLowerCase().includes(lotSearch.toLowerCase()))
                ).length === 0 && (
                        <div className="py-20 text-center bg-zinc-50 rounded-[3rem] border border-dashed border-zinc-200">
                            <Icon icon="solar:ghost-bold-duotone" className="w-12 h-12 text-zinc-300 mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">No matching lots found</p>
                        </div>
                    )}
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { background-position: 0 0; }
                    100% { background-position: 30px 30px; }
                }
            `}</style>
        </div>
    );
};
