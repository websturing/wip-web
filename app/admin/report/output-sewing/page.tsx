'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import { apiClient } from '@/lib/api';

export default function OutputSewingReportPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const setDatePreset = (preset: 'today' | 'week' | 'month') => {
        const d = new Date();
        const end = d.toISOString().split('T')[0];
        if (preset === 'today') {
            setStartDate(end);
            setEndDate(end);
        } else if (preset === 'week') {
            const start = new Date(d);
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(end);
        } else if (preset === 'month') {
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const yyyy = start.getFullYear();
            const mm = String(start.getMonth() + 1).padStart(2, '0');
            const dd = String(start.getDate()).padStart(2, '0');
            setStartDate(`${yyyy}-${mm}-${dd}`);
            setEndDate(end);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
            const res = await apiClient.get(`/productivity/output-sewing-report?${query}`);
            const json = await res.json();
            setData(json?.data || []);
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
            const res = await apiClient.get(`/productivity/output-sewing-report/export?${query}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Output_Sewing_Report_${startDate}_to_${endDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to export detailed statistics", error);
            alert("Failed to export detailed statistics");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="max-w-[1300px] mx-auto space-y-4 animate-in fade-in duration-700 p-4 lg:p-6">
            
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 rounded-[1.5rem] text-white shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Icon icon="solar:programming-bold-duotone" className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                            <Icon icon="solar:checklist-minimalistic-bold-duotone" className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                            Output Sewing Report
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-xs md:text-sm font-medium max-w-xl">
                        Comprehensive daily sewing output and production analysis.
                    </p>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md border border-emerald-500/30 p-3 rounded-xl flex items-start gap-3 max-w-xs">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                        <h4 className="text-xs font-bold text-emerald-300">Inline Workstation Only</h4>
                        <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                            Calculations strictly reflect <strong className="text-white">inline workstation</strong> output. Other sections are excluded.
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-zinc-200 p-3 rounded-xl shadow-sm">
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 p-1 rounded-lg shadow-inner">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-700"
                        />
                        <span className="text-zinc-300 text-xs">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-700"
                        />
                    </div>

                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                        <button onClick={() => setDatePreset('today')} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">Today</button>
                        <button onClick={() => setDatePreset('week')} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">Week</button>
                        <button onClick={() => setDatePreset('month')} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">Month</button>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 text-white px-5 py-2 rounded-lg shadow-sm transition-all font-bold text-xs uppercase tracking-wider"
                >
                    <Icon icon={isExporting ? "solar:hourglass-bold-duotone" : "solar:file-download-bold-duotone"} className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                    {isExporting ? 'Exporting...' : 'Export Excel'}
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-200">
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">GL-LOT</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Style</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Input Qty</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Output Qty</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Color</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Ship Date</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">SAM</th>
                                <th className="p-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">Minutes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-zinc-400">
                                        <Icon icon="solar:spinner-bold-duotone" className="w-6 h-6 animate-spin mx-auto mb-3" />
                                        <p className="text-xs font-bold tracking-wider uppercase">Loading Data...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-zinc-400">
                                        <Icon icon="solar:ghost-bold-duotone" className="w-6 h-6 mx-auto mb-3 opacity-50" />
                                        <p className="text-xs font-bold tracking-wider uppercase">No Data Found</p>
                                        <p className="text-[10px] mt-1">Try selecting a different date range.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="p-2.5 px-3 text-xs font-medium text-zinc-700 whitespace-nowrap">{item.date}</td>
                                        <td className="p-2.5 px-3 text-xs font-bold text-zinc-900 whitespace-nowrap">{item.gl_lot}</td>
                                        <td className="p-2.5 px-3 text-xs font-medium text-zinc-600 whitespace-nowrap">{item.style || '-'}</td>
                                        <td className="p-2.5 px-3 text-xs font-black text-zinc-700 text-right">{new Intl.NumberFormat().format(item.input_qty)}</td>
                                        <td className="p-2.5 px-3 text-xs font-black text-emerald-600 text-right">{new Intl.NumberFormat().format(item.output_qty)}</td>
                                        <td className="p-2.5 px-3 text-xs font-medium text-zinc-700 whitespace-nowrap">{item.color}</td>
                                        <td className="p-2.5 px-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{item.ship_date || '-'}</td>
                                        <td className="p-2.5 px-3 text-xs font-medium text-zinc-700 text-right">{item.sam}</td>
                                        <td className="p-2.5 px-3 text-xs font-black text-blue-600 text-right">{new Intl.NumberFormat().format(item.minutes)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
