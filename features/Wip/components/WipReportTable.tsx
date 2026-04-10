'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { WipReportService } from '../services/WipReportService';

export default function WipReportTable() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Logistics', icon: 'solar:box-bold-duotone' },
        { label: 'WIP Dashboard', icon: 'solar:pie-chart-bold-duotone' },
    ];

    useEffect(() => {
        WipReportService.getSummary().then(res => {
            if (res.status === 'success') {
                setData(res.data);
            }
            setIsLoading(false);
        });
    }, []);

    const formatNum = (num: number) => new Intl.NumberFormat().format(num);

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="WIP Production Dashboard"
                subtitle=""
                description="Consolidated overview of production status across all departments."
            />

            <div className="">
                <div className="flex items-center justify-end justify-between mb-4 px-2">

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-white hover:border-blue-200 transition-all text-[9px] font-bold gap-1 px-3 py-1 rounded-lg h-7"
                        >
                            <Icon icon="solar:refresh-line-duotone" className="w-3 h-3" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto no-scrollbar border border-zinc-300 shadow-sm relative rounded-md">
                    <table className="w-full border-collapse text-zinc-900 border-[1px] border-zinc-400">
                        <thead>
                            {/* ROW 1 HEADERS */}
                            <tr className="bg-white text-[#002060] font-bold h-7">
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">GL #</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Buyer/Customer</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Brand</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400 px-2">Style No</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Product Type</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400 bg-[#ffff00]">Ex Fty Date</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">FACTORY</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">GMT Delivery</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Ord (DZ)</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Ord (Pcs)</th>

                                <th colSpan={3} className="px-0.5 text-center text-[7px] border border-zinc-400 bg-[#92d050]">CUTTING</th>
                                <th colSpan={3} className="px-0.5 text-center text-[7px] border border-zinc-400 bg-[#00b0f0] text-white">SEWING</th>
                                <th colSpan={3} className="px-0.5 text-center text-[7px] border border-zinc-400 bg-[#ffccff]">PACKING</th>

                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Exp QTY</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Remarks</th>
                            </tr>

                            {/* ROW 2 HEADERS */}
                            <tr className="bg-[#95b3d7] text-[#002060] font-bold h-6">
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400 sticky left-0 bg-[#95b3d7] z-10">GL+LOT#</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Buyer</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Brand</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Style</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Type</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400 bg-[#ffff00]">Date</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">FTY</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">GMT</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">DZ</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">PCS</th>

                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#92d050]">CUTTING</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#92d050]">Bal-Ord</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#92d050]">ACCUM</th>

                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#00b0f0] text-white">SEWING</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#00b0f0] text-white">Ord-Sew</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#00b0f0] text-white">Cut-Sew</th>

                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#ffccff]">PACKING</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#ffccff]">Ord-Pack</th>
                                <th className="px-0.5 text-center text-[6.5px] border border-zinc-400 bg-[#ffccff]">Sew-Pack</th>

                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Exp</th>
                                <th className="px-0.5 text-center text-[7px] border border-zinc-400">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-8">
                                        {Array.from({ length: 21 }).map((_, j) => (
                                            <td key={j} className="px-1 border border-zinc-200">
                                                <div className="h-1.5 bg-zinc-100 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.length > 0 ? (
                                data.map((row, idx) => {
                                    const cutAcc = row.cutting_acc_output || 0;
                                    const sewAcc = row.sewing_acc_output || 0;
                                    const packAcc = row.packing_acc_output || 0;
                                    const order = row.order_qty_pcs || 0;

                                    return (
                                        <tr key={idx} className="hover:bg-zinc-50 transition-colors h-7">
                                            <td className="px-0.5 text-[8px] font-bold text-blue-700 border border-zinc-400 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] truncate max-w-[70px]">{row.gl_lot}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[80px]">{row.customer}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[60px]">{row.brand}</td>
                                            <td className="px-0.5 text-[8px] font-medium text-blue-700 border border-zinc-400 truncate max-w-[80px]">{row.style_no}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[70px]">FASHION TOP</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 bg-zinc-50 text-center"></td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 text-center">{row.fty || "B"}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 text-center uppercase">{row.gmt_delivery_date}</td>
                                            <td className="px-0.5 text-[9px] font-bold text-[#002060] border border-zinc-400 text-center">{Math.round(order / 12)}</td>
                                            <td className="px-0.5 text-[9px] font-bold text-[#002060] border border-zinc-400 text-center">{formatNum(order)}</td>

                                            {/* Cutting Body */}
                                            <td className="px-0.5 text-[9px] font-bold text-blue-700 border border-zinc-400 text-center bg-[#c6e0b4]">{formatNum(cutAcc)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (cutAcc - order) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-green-800 bg-[#c6e0b4]"
                                            )}>{formatNum(cutAcc - order)}</td>
                                            <td className="px-0.5 text-[8px] font-bold text-red-600 border border-zinc-400 text-center">{order > 0 ? ((cutAcc / order) * 100).toFixed(1).replace('.', ',') : "0,0"}%</td>

                                            {/* Sewing Body */}
                                            <td className="px-0.5 text-[9px] font-bold text-blue-700 border border-zinc-400 text-center bg-[#bdd7ee]">{formatNum(sewAcc)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (sewAcc - order) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-blue-800 bg-[#bdd7ee]"
                                            )}>{formatNum(sewAcc - order)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (sewAcc - cutAcc) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-blue-800 bg-[#bdd7ee]"
                                            )}>{formatNum(sewAcc - cutAcc)}</td>

                                            {/* Packing Body */}
                                            <td className="px-0.5 text-[9px] font-bold text-blue-700 border border-zinc-400 text-center bg-[#e4dfec]">{formatNum(packAcc)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (packAcc - order) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-pink-800 bg-[#e4dfec]"
                                            )}>{formatNum(packAcc - order)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (packAcc - sewAcc) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-pink-800 bg-[#e4dfec]"
                                            )}>{formatNum(packAcc - sewAcc)}</td>

                                            <td className="px-0.5 text-[9px] font-bold text-[#002060] border border-zinc-400 text-center">-</td>
                                            <td className="px-0.5 text-[7px] font-medium text-blue-700 border border-zinc-400 italic truncate max-w-[80px]">NO PACK YET</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={21} className="px-4 py-10 text-center text-zinc-400 font-bold uppercase tracking-widest text-[8px]">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* FOOTER TOTALS */}
                        {data.length > 0 && (
                            <tfoot className="bg-white font-bold text-[#002060]">
                                <tr className="border-t-2 border-zinc-400 h-8">
                                    <td className="px-0.5 text-[8px] border border-zinc-400 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">TOTAL</td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[7px]">{data.length}</td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400 text-right text-[8px]">0</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px]">{formatNum(data.reduce((sum, r) => sum + Math.round((r.order_qty_pcs || 0) / 12), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] font-black">{formatNum(data.reduce((sum, r) => sum + (r.order_qty_pcs || 0), 0))}</td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#c6e0b4]">{formatNum(data.reduce((sum, r) => sum + (r.cutting_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#c6e0b4]"></td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#c6e0b4]"></td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#bdd7ee] font-black">{formatNum(data.reduce((sum, r) => sum + (r.sewing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] bg-[#bdd7ee] text-red-600">-{formatNum(data.reduce((sum, r) => sum + (r.order_qty_pcs || 0) - (r.sewing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#bdd7ee]"></td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#e4dfec] font-black">{formatNum(data.reduce((sum, r) => sum + (r.packing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] bg-[#e4dfec] text-red-600">-{formatNum(data.reduce((sum, r) => sum + (r.order_qty_pcs || 0) - (r.packing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#e4dfec]"></td>

                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
