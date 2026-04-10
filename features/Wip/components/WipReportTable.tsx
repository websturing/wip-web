'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { WipReportService } from '../services/WipReportService';

export default function WipReportTable() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGls, setSelectedGls] = useState<(string | number)[]>([]);
    const [glOptions, setGlOptions] = useState<{ id: string, label: string }[]>([]);
    const [editingExport, setEditingExport] = useState<{ id: string, val: string } | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Logistics', icon: 'solar:box-bold-duotone' },
        { label: 'WIP Dashboard', icon: 'solar:pie-chart-bold-duotone' },
    ];

    useEffect(() => {
        loadData();
    }, [selectedGls]);

    const loadData = () => {
        setIsLoading(true);
        // Map selected IDs back to lot codes if necessary, or just use strings
        WipReportService.getSummary(selectedGls.map(String)).then(res => {
            if (res.status === 'success') {
                setData(res.data);
                if (res.gl_options) {
                    // Extract unique GL parts for the filter options
                    const uniqueGls = Array.from(new Set(res.gl_options.map((code: string) =>
                        code.includes('-') ? code.split('-')[0] : code
                    ))) as string[];

                    setGlOptions(uniqueGls.sort().map(gl => ({ id: gl, label: gl })));
                }
            }
            setIsLoading(false);
        });
    };

    const handleExportUpdate = async (lotId: string, qty: string) => {
        const val = parseInt(qty);
        if (isNaN(val)) return;

        try {
            await WipReportService.saveExportQty(lotId, val);
            setEditingExport(null);
            // Update local state for immediate feedback
            setData(prev => prev.map(item => item.lot_id === lotId ? { ...item, export_qty: val } : item));
        } catch (error) {
            console.error(error);
        }
    };

    const formatNum = (num: number) => new Intl.NumberFormat().format(num);

    const filteredData = useMemo(() => {
        return data; // Backend already filtered this for us
    }, [data]);

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="WIP Production Dashboard"
                subtitle=""
                description="Consolidated overview of production status across all departments."
            />

            <div className="">
                <div className="flex items-center justify-between mb-4 px-2 gap-4">
                    <div className="flex-1 max-w-[400px]">
                        {glOptions.length > 0 && (
                            <MultiSelect
                                options={glOptions}
                                value={selectedGls}
                                onChange={setSelectedGls}
                                placeholder="Filter GL Numbers (Search All...)"
                            />
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-white hover:border-blue-200 transition-all text-[9px] font-bold gap-1 px-3 py-1 rounded-lg h-12"
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
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, idx) => {
                                    const isCut404 = row.cutting_acc_output === 'E404';
                                    const cutAcc = isCut404 ? 0 : (row.cutting_acc_output || 0);
                                    const sewAcc = row.sewing_acc_output || 0;
                                    const packAcc = row.packing_acc_output || 0;
                                    const order = row.order_qty_pcs || 0;

                                    return (
                                        <tr key={idx} className="hover:bg-zinc-50 transition-colors h-7">
                                            <td className="px-0.5 text-[8px] font-bold text-blue-700 border border-zinc-400 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] truncate max-w-[70px]">{row.gl_lot}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[80px]">{row.customer}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[60px]">{row.brand}</td>
                                            <td className="px-0.5 text-[8px] font-medium text-blue-700 border border-zinc-400 truncate max-w-[80px]">{row.style_no}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 truncate max-w-[70px] text-center">-</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 bg-zinc-50 text-center">{row.ex_fty_date}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 text-center">{row.fty || "B"}</td>
                                            <td className="px-0.5 text-[7px] font-medium text-[#002060] border border-zinc-400 text-center uppercase">{row.gmt_delivery_date}</td>
                                            <td className="px-0.5 text-[9px] font-bold text-[#002060] border border-zinc-400 text-center">{Math.round(order / 12)}</td>
                                            <td className="px-0.5 text-[9px] font-bold text-[#002060] border border-zinc-400 text-center">{formatNum(order)}</td>

                                            {/* Cutting Body */}
                                            <td className="px-0.5 text-[9px] font-bold text-blue-700 border border-zinc-400 text-center bg-[#c6e0b4]">{isCut404 ? 'E404' : formatNum(cutAcc)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                isCut404 ? "text-red-500 bg-[#f8d7da]" : ((cutAcc - order) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-green-800 bg-[#c6e0b4]")
                                            )}>{isCut404 ? 'E404' : formatNum(cutAcc - order)}</td>
                                            <td className="px-0.5 text-[8px] font-bold text-red-600 border border-zinc-400 text-center">{isCut404 ? '-' : (order > 0 ? ((cutAcc / order) * 100).toFixed(1).replace('.', ',') : "0,0")}%</td>

                                            {/* Sewing Body */}
                                            <td className="px-0.5 text-[9px] font-bold text-blue-700 border border-zinc-400 text-center bg-[#bdd7ee]">{formatNum(sewAcc)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                (sewAcc - order) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-blue-800 bg-[#bdd7ee]"
                                            )}>{formatNum(sewAcc - order)}</td>
                                            <td className={cn(
                                                "px-0.5 text-[9px] font-bold border border-zinc-400 text-center",
                                                isCut404 ? "text-blue-800 bg-[#bdd7ee]" : ((sewAcc - cutAcc) < 0 ? "text-red-600 bg-[#f8d7da]" : "text-blue-800 bg-[#bdd7ee]")
                                            )}>{isCut404 ? '-' : formatNum(sewAcc - cutAcc)}</td>

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

                                            <td
                                                className={cn(
                                                    "px-0.5 text-[9px] font-bold text-center border border-zinc-400 cursor-pointer transition-all",
                                                    editingExport?.id === row.lot_id ? "bg-orange-50 ring-2 ring-orange-500/50 z-20" : "text-[#002060] hover:bg-orange-50"
                                                )}
                                                onClick={() => setEditingExport({ id: row.lot_id, val: (row.export_qty || 0).toString() })}
                                            >
                                                {editingExport?.id === row.lot_id ? (
                                                    <input
                                                        autoFocus
                                                        className="w-full bg-transparent border-none outline-none text-center font-bold text-[#002060]"
                                                        value={editingExport?.val || ''}
                                                        onChange={(e) => setEditingExport(prev => prev ? { ...prev, val: e.target.value } : null)}
                                                        onBlur={() => handleExportUpdate(row.lot_id, editingExport?.val || '')}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleExportUpdate(row.lot_id, editingExport?.val || '');
                                                            if (e.key === 'Escape') setEditingExport(null);
                                                        }}
                                                    />
                                                ) : (
                                                    formatNum(row.export_qty || 0)
                                                )}
                                            </td>
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
                        {filteredData.length > 0 && (
                            <tfoot className="bg-white font-bold text-[#002060]">
                                <tr className="border-t-2 border-zinc-400 h-8">
                                    <td className="px-0.5 text-[8px] border border-zinc-400 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">TOTAL</td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[7px]">{filteredData.length}</td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400"></td>
                                    <td className="px-0.5 border border-zinc-400 text-right text-[8px]">0</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px]">{formatNum(filteredData.reduce((sum, r) => sum + Math.round((r.order_qty_pcs || 0) / 12), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] font-black">{formatNum(filteredData.reduce((sum, r) => sum + (r.order_qty_pcs || 0), 0))}</td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#c6e0b4]">{formatNum(filteredData.reduce((sum, r) => sum + (typeof r.cutting_acc_output === 'number' ? r.cutting_acc_output : 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#c6e0b4]"></td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#c6e0b4]"></td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#bdd7ee] font-black">{formatNum(filteredData.reduce((sum, r) => sum + (r.sewing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] bg-[#bdd7ee] text-red-600">-{formatNum(filteredData.reduce((sum, r) => sum + (r.order_qty_pcs || 0) - (r.sewing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#bdd7ee]"></td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-blue-800 bg-[#e4dfec] font-black">{formatNum(filteredData.reduce((sum, r) => sum + (r.packing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] bg-[#e4dfec] text-red-600">-{formatNum(filteredData.reduce((sum, r) => sum + (r.order_qty_pcs || 0) - (r.packing_acc_output || 0), 0))}</td>
                                    <td className="px-0.5 border border-zinc-400 bg-[#e4dfec]"></td>

                                    <td className="px-0.5 border border-zinc-400 text-center text-[9px] text-[#002060] font-black">{formatNum(filteredData.reduce((sum, r) => sum + (r.export_qty || 0), 0))}</td>
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
