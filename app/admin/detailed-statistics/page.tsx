'use client';

import { useState, useEffect } from 'react';
import DetailedStatisticsTable from '@/features/productivity/components/DetailedStatisticsTable';
import { Icon } from '@/app/components/ui/Icon';
import { apiClient } from '@/lib/api';

type TabType = 'active' | 'prolonged';

export default function DetailedStatisticsPage() {
    const [allData, setAllData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Tab and Filter State
    const [activeTab, setActiveTab] = useState<TabType>('active');
    
    // Default Date Range: Last 7 days to today
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await apiClient.get('/productivity/detailed-statistics');
                const json = await res.json();
                setAllData(json?.data || []);
            } catch (error) {
                console.error("Failed to fetch detailed statistics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to check if a date is within range
    const isWithinDateRange = (dateStr: string) => {
        if (!dateStr || !startDate || !endDate) return false;
        const d = new Date(dateStr);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Reset times for accurate day comparison
        d.setHours(0,0,0,0);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        
        return d >= start && d <= end;
    };

    // Filter data based on selected tab and date range
    const filteredData = allData.filter(item => {
        const isActiveInRange = isWithinDateRange(item.last_update);
        const isPending = item.balance < 0 && !isActiveInRange;

        if (activeTab === 'active') {
            return isActiveInRange;
        } else if (activeTab === 'prolonged') {
            return isPending;
        }
        return true;
    });

    // Calculate Summary Cards Data
    const activeGLs = allData.filter(item => isWithinDateRange(item.last_update));
    const activeGLsCount = activeGLs.length;
    const pendingGLsCount = allData.filter(item => item.balance < 0 && !isWithinDateRange(item.last_update)).length;
    
    // Avg achievement tied to the date range (only active GLs)
    const avgAchievement = activeGLsCount > 0 
        ? activeGLs.reduce((sum, item) => sum + item.achievement, 0) / activeGLsCount 
        : 0;

    // Achievement Breakdown
    const highAchievementCount = activeGLs.filter(item => item.achievement >= 80).length;
    const midAchievementCount = activeGLs.filter(item => item.achievement >= 50 && item.achievement < 80).length;
    const lowAchievementCount = activeGLs.filter(item => item.achievement < 50).length;

    return (
        <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-700 p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:chart-square-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Detailed Statistics</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Sewing Output Analysis</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1.5 rounded-xl shadow-sm">
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-600"
                        />
                        <span className="text-zinc-300">-</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none px-2 text-zinc-600"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:bolt-circle-bold-duotone" className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Active GLs</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : activeGLsCount}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Dalam rentang tanggal terpilih</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Icon icon="solar:pie-chart-3-bold-duotone" className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Health Breakdown</span>
                    </div>
                    <div className="flex items-end justify-between mt-1">
                        <div className="text-center">
                            <div className="text-lg font-black text-emerald-600">{isLoading ? '-' : highAchievementCount}</div>
                            <div className="text-[9px] font-bold text-zinc-400 uppercase">&ge;80%</div>
                        </div>
                        <div className="w-px h-6 bg-zinc-200"></div>
                        <div className="text-center">
                            <div className="text-lg font-black text-amber-500">{isLoading ? '-' : midAchievementCount}</div>
                            <div className="text-[9px] font-bold text-zinc-400 uppercase">50-79%</div>
                        </div>
                        <div className="w-px h-6 bg-zinc-200"></div>
                        <div className="text-center">
                            <div className="text-lg font-black text-red-500">{isLoading ? '-' : lowAchievementCount}</div>
                            <div className="text-[9px] font-bold text-zinc-400 uppercase">&lt;50%</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:target-bold-duotone" className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Avg. Achievement</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : `${avgAchievement.toFixed(1)}%`}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Rata-rata dari GL yang sedang aktif</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Pending GLs</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : pendingGLsCount}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Belum tuntas tapi tidak ada produksi</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-200 pb-px mt-4">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'active' 
                        ? 'border-zinc-900 text-zinc-900' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                    Active GLs
                </button>
                <button 
                    onClick={() => setActiveTab('prolonged')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                        activeTab === 'prolonged' 
                        ? 'border-zinc-900 text-zinc-900' 
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                    Pending / Inactive GLs
                </button>
            </div>

            <DetailedStatisticsTable data={filteredData} isLoading={isLoading} />
        </div>
    );
}
