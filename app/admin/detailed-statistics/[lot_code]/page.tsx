'use client';

import { useEffect, useState, use, useMemo } from 'react';
import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { WipReportService } from '@/features/Wip/services/WipReportService';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function LotDetailedBreakdownPage({ params }: { params: Promise<{ lot_code: string }> }) {
    const resolvedParams = use(params);
    const lotCode = decodeURIComponent(resolvedParams.lot_code);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Detailed Statistics', href: '/admin/detailed-statistics', icon: 'solar:chart-square-bold-duotone' },
        { label: `Lot ${lotCode}`, icon: 'solar:tag-bold-duotone' },
    ];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setErrorMsg(null);
            try {
                // Fetch colors for this lot
                const colorRes = await WipReportService.getLotColors(lotCode);
                if (colorRes.status === 'success') {
                    const colors = colorRes.data;
                    if (!colors || colors.length === 0) {
                        setErrorMsg('No colors found for this lot.');
                        setIsLoading(false);
                        return;
                    }

                    // Fetch the detailed breakdown
                    const summaryRes = await WipReportService.getBalanceSummary(lotCode, colors);
                    if (summaryRes.status === 'success') {
                        setData(summaryRes.data);
                    } else {
                        setErrorMsg(summaryRes.message || 'Failed to fetch summary data');
                    }
                } else {
                    setErrorMsg(colorRes.message || 'Failed to fetch lot colors');
                }
            } catch (error: any) {
                console.error("Failed to load lot breakdown", error);
                setErrorMsg(error.message || 'Network error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [lotCode]);

    const setBreakdowns = useMemo(() => {
        if (!data?.reports) return null;
        
        const parts: any = {};
        let isSetItem = false;

        data.reports.forEach((report: any) => {
            let baseName = report.color;
            let type = 'other';
            
            const match = report.color.match(/(.*?)\s*\((TOP|PANT|PANTS)\)$/i);
            if (match) {
                baseName = match[1].trim();
                type = match[2].toUpperCase() === 'TOP' ? 'top' : 'pant';
                isSetItem = true;
            }

            if (!parts[baseName]) {
                parts[baseName] = { top_input: 0, pant_input: 0, top_output: 0, pant_output: 0, has_set: false };
            }

            const inputTotal = report.input.reduce((sum: number, r: any) => sum + r.total, 0);
            const outputTotal = report.output.reduce((sum: number, r: any) => sum + r.total, 0);

            if (type === 'top') {
                parts[baseName].top_input += inputTotal;
                parts[baseName].top_output += outputTotal;
                parts[baseName].has_set = true;
            } else if (type === 'pant') {
                parts[baseName].pant_input += inputTotal;
                parts[baseName].pant_output += outputTotal;
                parts[baseName].has_set = true;
            }
        });

        if (!isSetItem) return null;
        return parts;
    }, [data]);

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
                <PageHeader
                    items={breadcrumbItems}
                    title={`Lot Breakdown: ${lotCode}`}
                    description="Detailed size and color breakdown compared with Cutting API."
                />
                <Link href="/admin/detailed-statistics" className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-colors">
                    <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                    Back to Statistics
                </Link>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <Icon icon="solar:spinner-bold-duotone" className="w-12 h-12 text-zinc-300 animate-spin mb-4" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Loading Breakdown</h3>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Style Number</p>
                            <p className="text-lg font-black text-zinc-900">{data.header.style}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Order Qty</p>
                            <p className="text-lg font-black text-zinc-900">{new Intl.NumberFormat('en-US').format(data.header.order_qty)} pcs</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Buyer</p>
                            <p className="text-lg font-black text-zinc-900">{data.header.buyer}</p>
                        </div>
                    </div>

                    {setBreakdowns && Object.keys(setBreakdowns).length > 0 && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
                                <h5 className="text-[12px] font-black uppercase tracking-widest text-blue-800">Set Item Breakdown</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(setBreakdowns).map(([baseName, parts]: [string, any], idx) => {
                                    if (!parts.has_set) return null;
                                    const combinedInput = Math.min(parts.top_input, parts.pant_input);
                                    const combinedOutput = Math.min(parts.top_output, parts.pant_output);
                                    return (
                                        <div key={idx} className="bg-white border border-blue-100/50 rounded-xl p-4 shadow-sm text-xs">
                                            <div className="font-bold text-blue-900 mb-3">{baseName}</div>
                                            <div className="flex flex-col gap-2 text-zinc-600">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-[10px] uppercase tracking-widest">TOP</span>
                                                    <span><span className="font-black text-zinc-900">{parts.top_output}</span> / <span className="font-medium text-zinc-500">{parts.top_input}</span></span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-[10px] uppercase tracking-widest">PANTS</span>
                                                    <span><span className="font-black text-zinc-900">{parts.pant_output}</span> / <span className="font-medium text-zinc-500">{parts.pant_input}</span></span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-50">
                                                    <span className="font-bold text-[10px] uppercase tracking-widest text-blue-600">COMBINED</span>
                                                    <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{combinedOutput}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {data.reports.map((report: any, rIdx: number) => (
                        <div key={rIdx} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Icon icon="solar:palette-bold" className="w-5 h-5 text-white" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{report.color}</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                                            <th className="p-3 border-b border-r border-zinc-200">Metric</th>
                                            {data.sizes.map((s: string) => (
                                                <th key={s} className="p-3 border-b border-zinc-200 text-center min-w-[50px]">{s}</th>
                                            ))}
                                            <th className="p-3 border-b border-l border-zinc-200 bg-zinc-100 text-center min-w-[70px]">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 font-medium">
                                        <tr className="hover:bg-zinc-50/50">
                                            <td className="p-3 border-r border-zinc-200 text-blue-700 font-black">Actual Cut (Cutting API)</td>
                                            {data.sizes.map((s: string) => (
                                                <td key={s} className="p-3 text-center text-zinc-700">{report.cutting_qty?.sizes[s] || '-'}</td>
                                            ))}
                                            <td className="p-3 border-l border-zinc-200 bg-zinc-50 text-center font-bold text-blue-700">{report.cutting_qty?.total || 0}</td>
                                        </tr>
                                        <tr className="hover:bg-zinc-50/50">
                                            <td className="p-3 border-r border-zinc-200 text-zinc-700 font-bold">Total Input (Sewing)</td>
                                            {data.sizes.map((s: string) => {
                                                const totalIn = report.input.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                                                return <td key={s} className="p-3 text-center text-zinc-700">{totalIn || '-'}</td>;
                                            })}
                                            <td className="p-3 border-l border-zinc-200 bg-zinc-50 text-center font-bold">
                                                {report.input.reduce((sum: number, r: any) => sum + r.total, 0)}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-zinc-50/50">
                                            <td className="p-3 border-r border-zinc-200 text-emerald-600 font-black">Total Output (Sewing)</td>
                                            {data.sizes.map((s: string) => {
                                                const totalOut = report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                                                return <td key={s} className="p-3 text-center text-zinc-700">{totalOut || '-'}</td>;
                                            })}
                                            <td className="p-3 border-l border-zinc-200 bg-zinc-50 text-center font-bold text-emerald-600">
                                                {report.output.reduce((sum: number, r: any) => sum + r.total, 0)}
                                            </td>
                                        </tr>
                                        <tr className="bg-red-50/30 text-red-600 font-bold">
                                            <td className="p-3 border-r border-zinc-200 uppercase tracking-widest text-[10px]">Diff (Output - Cut)</td>
                                            {data.sizes.map((s: string) => {
                                                const cutQty = report.cutting_qty?.sizes[s] || 0;
                                                const totalOut = report.output.reduce((sum: number, r: any) => sum + (r.sizes[s] || 0), 0);
                                                const diff = totalOut - cutQty;
                                                const diffDisplay = diff === 0 ? '-' : (diff > 0 ? `+${diff}` : diff);
                                                return <td key={s} className={cn("p-3 text-center", diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-zinc-600")}>{diffDisplay}</td>;
                                            })}
                                            <td className="p-3 border-l border-zinc-200 bg-red-50 text-center font-black">
                                                {(() => {
                                                    const cutT = report.cutting_qty?.total || 0;
                                                    const outT = report.output.reduce((sum: number, r: any) => sum + r.total, 0);
                                                    const diffT = outT - cutT;
                                                    return diffT === 0 ? '-' : (diffT > 0 ? `+${diffT}` : diffT);
                                                })()}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
                    <Icon icon="solar:folder-error-bold-duotone" className="w-12 h-12 text-zinc-300 mb-4" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">No Data Found</h3>
                    <p className="text-xs text-zinc-500 mt-2">Could not load breakdown data for lot {lotCode}.</p>
                    {errorMsg && (
                        <div className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 max-w-md text-center">
                            {errorMsg}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
