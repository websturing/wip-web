'use client';

import { useState, useEffect } from 'react';
import ProductivitySummaryTable from './ProductivitySummaryTable';
import { Icon } from '@/app/components/ui/Icon';
import { apiClient } from '@/lib/api';

export default function ProductivityReportPage() {
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.get(`/productivity/report-data?date=${date}`);
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
            await apiClient.download(`/productivity/export-daily?date=${date}`, `Productivity_${date}.xlsx`);
        } catch (error) {
            console.error("Failed to export data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    return (
        <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:chart-square-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Productivity Summary</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Daily Report</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-zinc-100 shadow-sm p-6 lg:p-8 relative">
                <div className="flex flex-wrap items-end gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Report Date</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="bg-zinc-50 border border-zinc-200 h-10 px-4 rounded-xl text-sm outline-none focus:border-zinc-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={fetchData} 
                            disabled={isLoading}
                            className="px-6 h-10 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                        <button 
                            onClick={handleExport}
                            className="px-6 h-10 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <Icon icon="solar:download-square-bold" className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <div className="w-8 h-8 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center p-8 text-zinc-500 border rounded-2xl bg-zinc-50">No data available for the selected date.</div>
            ) : (
                <div className="flex flex-col gap-8">
                    {data.map((group, i) => (
                        <div key={i} className="overflow-x-auto pb-4">
                            <ProductivitySummaryTable date={date} data={group} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
