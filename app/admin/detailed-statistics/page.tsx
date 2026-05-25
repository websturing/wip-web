'use client';

import { useState, useEffect } from 'react';
import DetailedStatisticsTable from '@/features/productivity/components/DetailedStatisticsTable';
import { Icon } from '@/app/components/ui/Icon';
import { apiClient } from '@/lib/api';

type TabType = 'active' | 'prolonged' | 'cutting';

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
                const query = new URLSearchParams({ start_date: startDate, end_date: endDate }).toString();
                const res = await apiClient.get(`/productivity/detailed-statistics?${query}`);
                const json = await res.json();
                setAllData(json?.data || []);
            } catch (error) {
                console.error("Failed to fetch detailed statistics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [startDate, endDate]);

    // Helper to check if a date is within range
    const isWithinDateRange = (dateStr: string) => {
        if (!dateStr || !startDate || !endDate) return false;
        const d = new Date(dateStr);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Reset times for accurate day comparison
        d.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

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
            const start = new Date(d.getFullYear(), d.getMonth(), 2); // 2 to offset timezone if needed, better use UTC or local
            const localStart = new Date(d.getFullYear(), d.getMonth(), 1);
            // simple format
            const yyyy = localStart.getFullYear();
            const mm = String(localStart.getMonth() + 1).padStart(2, '0');
            const dd = String(localStart.getDate()).padStart(2, '0');
            setStartDate(`${yyyy}-${mm}-${dd}`);
            setEndDate(end);
        }
    };
    const totalInputDisplay = filteredData.reduce((sum, item) => sum + (item.order_qty || 0), 0);
    const totalOutputDisplay = filteredData.reduce((sum, item) => sum + (item.output_qty || 0), 0);

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
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Summary Statistic</h1>
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

                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-sm">
                        <button onClick={() => setDatePreset('today')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">Today</button>
                        <button onClick={() => setDatePreset('week')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">This Week</button>
                        <button onClick={() => setDatePreset('month')} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-zinc-900 hover:shadow-sm transition-all text-zinc-500">This Month</button>
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
                    <p className="text-[10px] font-bold text-zinc-400">On Selected Date Range</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                        <Icon icon="solar:pie-chart-3-bold-duotone" className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-black tracking-widest uppercase">On Track</span>
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
                    <p className="text-[10px] font-bold text-zinc-400">Avg On Selected Date Range</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Pending GLs</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : pendingGLsCount}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Pending / Inactive GLs</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Total Input</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : new Intl.NumberFormat('en-US').format(totalInputDisplay)}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Total Order on Selected Tab</p>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <Icon icon="solar:box-bold-duotone" className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-black tracking-widest uppercase">Total Output</span>
                    </div>
                    <div className="text-3xl font-black text-zinc-900">
                        {isLoading ? '-' : new Intl.NumberFormat('en-US').format(totalOutputDisplay)}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400">Total Output on Selected Tab</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-200 pb-px mt-4">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'active'
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                >
                    Active GLs
                </button>
                <button
                    onClick={() => setActiveTab('prolonged')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'prolonged'
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                >
                    Pending / Inactive GLs
                </button>
                <button
                    onClick={() => setActiveTab('cutting')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'cutting'
                        ? 'border-zinc-900 text-zinc-900'
                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                        }`}
                >
                    Finished Cut (Cutting)
                </button>
            </div>

            {activeTab === 'cutting' ? (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-4">
                    <Icon icon="solar:programming-bold-duotone" className="w-16 h-16 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-black text-zinc-900 tracking-tight">Work in Progress</h3>
                    <p className="text-sm font-medium text-zinc-500 mt-1 max-w-md">This feature is currently under development. The Cutting (Finished Cut) statistics will be available soon.</p>
                </div>
            ) : (
                <div className="mt-4">
                    <DetailedStatisticsTable data={filteredData} isLoading={isLoading} />
                </div>
            )}
        </div>
    );
}
