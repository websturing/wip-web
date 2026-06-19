'use client';

import { Icon } from '@/app/components/ui/Icon';
import {
    Toast,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/app/components/ui/Toast';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { ProductionService } from '@/features/Production/services/ProductionService';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [isToastOpen, setIsToastOpen] = useState(false);
    const [activeRange, setActiveRange] = useState(7);
    const [hoveredData, setHoveredData] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardStats = async (range: number = 7) => {
        setIsLoading(true);
        try {
            const res = await ProductionService.getDashboardStats(range);
            if (res.status === 'success') {
                setStats(res.data);
            }
        } catch (error) {
            console.error('FAILED_TO_LOAD_STATS', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats(activeRange);
    }, [activeRange]);

    // Get real roles from user object
    const userRoles = user?.role?.name ? [user.role.name] : [];
    const assignedLines = ['A1', 'A2', 'A3', 'A4', 'A5'];

    return (
        <ToastProvider swipeDirection="up" duration={5000}>
            <div className="relative animate-in fade-in duration-700 min-h-screen pb-20">
                <Toast open={isToastOpen} onOpenChange={setIsToastOpen} className="data-state-open-animate-slide-in-top">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <ToastTitle>Logged In Successfully</ToastTitle>
                            <ToastDescription>
                                Authenticated: {user?.email || 'Administrator'}
                            </ToastDescription>
                        </div>
                    </div>
                </Toast>

                {/* Professional Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-[4px] animate-in fade-in duration-300">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all duration-500 animate-pulse"></div>
                            <div className="relative w-16 h-16 border-4 border-zinc-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col items-center gap-2">
                            <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.2em] animate-pulse">Synchronizing Data</h2>
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Header & Breadcrumb */}
                <div className="glass-panel border-b px-8 py-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-lg font-bold text-zinc-800">Home</h1>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                <span>Home</span>
                                <Icon icon="solar:alt-arrow-right-bold" className="w-2.5 h-2.5" />
                                <span>Dashboard</span>
                                <Icon icon="solar:alt-arrow-right-bold" className="w-2.5 h-2.5" />
                                <span className="text-indigo-600">Home</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 max-w-[1600px] mx-auto">
                    {/* Main Welcome Message */}
                    <div className="mb-10 md:mb-12">
                        <h1 className="font-bold text-zinc-900 tracking-tight mb-2">
                            Welcome Back, <span className="text-zinc-800">{user?.email || 'admin@admin.com'}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <span className="text-[10px] md:text-xs font-bold text-zinc-400">You have</span>
                            <div className="flex flex-wrap gap-2">
                                {userRoles.map((role, i) => (
                                    <span
                                        key={i}
                                        className={`px-2.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${role.toLowerCase().includes('admin')
                                            ? 'bg-green-100/50 text-green-700 border border-green-200'
                                            : 'bg-teal-100/50 text-teal-700 border border-teal-200'
                                            }`}
                                    >
                                        {role}
                                    </span>
                                ))}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-zinc-400">roles</span>
                        </div>
                    </div>

                    {/* Assigned Lines */}
                    <div className="mb-12 md:mb-14">
                        <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-4">Assigned Lines:</label>
                        <div className="flex flex-wrap gap-2 items-center">
                            {assignedLines.slice(0, 3).map((line, i) => (
                                <div key={i} className="px-3 md:px-4 py-1.5 md:py-2 glass-panel rounded-xl flex items-center gap-2 group transition-all hover:scale-110 active:scale-95 cursor-pointer">
                                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500"></span>
                                    <span className="text-[11px] md:text-xs font-bold text-zinc-900">{line}</span>
                                </div>
                            ))}
                            <span className="text-[11px] md:text-xs font-bold text-blue-600 pl-2 md:pl-4">+17 more</span>
                        </div>
                    </div>

                    {/* Top 6 Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="glass-panel p-6 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-800">{stats?.active_lines?.length || 0}</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Lines</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                                    <Icon icon="solar:wallet-bold-duotone" className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-800">
                                        {stats?.output_chart?.at(-1)?.total_output || 0}
                                    </h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Today Output</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                                    <Icon icon="solar:medical-kit-bold-duotone" className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-800">85%</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Stability</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Analytical Chart Overlay */}
                        <div className="lg:col-span-12">
                            <div className="glass-panel rounded-lg flex flex-col">
                                <div className="p-8 pb-4">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-xl font-bold text-zinc-800 tracking-tight">Production Output</h2>
                                            <p className="text-xs text-zinc-400 font-medium">Monitoring cumulative garment throughput across nodes.</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-20">
                                            <div className="w-8 h-8 rounded flex items-center justify-center border border-zinc-200"><Icon icon="solar:maximize-bold" className="w-4 h-4" /></div>
                                            <div className="w-8 h-8 rounded flex items-center justify-center border border-zinc-200"><Icon icon="solar:menu-dots-bold" className="w-4 h-4" /></div>
                                        </div>
                                    </div>

                                    {/* Metrics HUD from user screenshot */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-400 mb-2">Total Output</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-bold text-zinc-900 tracking-tighter">
                                                    {(stats?.output_chart?.reduce((a: any, b: any) => a + Number(b.total_output), 0) || 0).toLocaleString()}
                                                </h3>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                    <Icon icon="solar:double-alt-arrow-right-bold" className="w-3 h-3" />
                                                    TOTAL INPUT
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-4xl font-bold text-amber-600 tracking-tighter">
                                                    {(stats?.output_chart?.reduce((a: any, b: any) => a + Number(b.total_input), 0) || 0).toLocaleString()}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabs Section from user screenshot */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex bg-zinc-100 p-1 rounded-lg">
                                            <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-[11px] font-bold text-zinc-800">Timeline</button>
                                            <button className="px-4 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-600">List</button>
                                        </div>
                                        <div className="flex bg-zinc-100 p-1 rounded-lg">
                                            {[
                                                { label: '7D', val: 7 },
                                                { label: '1M', val: 30 },
                                                { label: '3M', val: 90 }
                                            ].map(t => (
                                                <button
                                                    key={t.label}
                                                    onClick={() => setActiveRange(t.val)}
                                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeRange === t.val ? 'bg-white shadow-sm text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'}`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 pt-0 flex-1 flex flex-col">
                                    <div className="relative flex-1 min-h-[400px]">
                                        {isLoading ? (
                                            <div className="absolute inset-0 flex items-center justify-center text-zinc-200 font-bold uppercase tracking-widest text-[10px]">Processing Data Nodes...</div>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col">
                                                <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                                    {/* Grid Horizontal */}
                                                    {[0, 1, 2, 3, 4].map((i) => (
                                                        <g key={i}>
                                                            <line x1="0" y1={300 - i * 75} x2="1000" y2={300 - i * 75} stroke="#f1f1f4" strokeWidth="1" />
                                                            <text x="-35" y={305 - i * 75} className="text-[12px] fill-zinc-300 font-bold">{i * 100}</text>
                                                        </g>
                                                    ))}

                                                    {/* Multiline Chart Logic */}
                                                    {(() => {
                                                        const data = stats?.output_chart || [];
                                                        if (data.length < 2) return null;
                                                        const maxVal = Math.max(
                                                            ...data.map((d: any) => Math.max(Number(d.total_output), Number(d.total_input))),
                                                            400
                                                        ) * 1.2;

                                                        const getX = (i: number) => (i / (data.length - 1)) * 1000;
                                                        const getY = (val: number) => 300 - (val / maxVal) * 300;

                                                        // Actual Output Line (Indigo)
                                                        const actualPoints = data.map((d: any, i: number) => `${getX(i)},${getY(Number(d.total_output))}`).join(' ');

                                                        // Input Line (Orange Dashed)
                                                        const targetPoints = data.map((d: any, i: number) => `${getX(i)},${getY(Number(d.total_input))}`).join(' ');

                                                        return (
                                                            <>
                                                                {/* Input Line - Dashed Orange */}
                                                                <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" points={targetPoints} className="opacity-40" />

                                                                {/* Output Line - Solid Indigo */}
                                                                <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={actualPoints} />

                                                                {/* Hover Detection Overlay */}
                                                                {data.map((d: any, i: number) => (
                                                                    <rect
                                                                        key={`hover-${i}`}
                                                                        x={getX(i) - 20}
                                                                        y="0"
                                                                        width="40"
                                                                        height="300"
                                                                        fill="transparent"
                                                                        onMouseEnter={() => setHoveredData({ ...d, x: getX(i), y: getY(Number(d.total_output)) })}
                                                                        onMouseLeave={() => setHoveredData(null)}
                                                                        className="cursor-crosshair"
                                                                    />
                                                                ))}

                                                                {/* Point Markers */}
                                                                {data.map((d: any, i: number) => (
                                                                    <g key={i}>
                                                                        <circle cx={getX(i)} cy={getY(Number(d.total_output))} r="4" fill="white" stroke="#6366f1" strokeWidth="2.5" />
                                                                        <circle cx={getX(i)} cy={getY(Number(d.total_input))} r="4" fill="white" stroke="#f59e0b" strokeWidth="2.5" className="opacity-40" />
                                                                    </g>
                                                                ))}
                                                            </>
                                                        );
                                                    })()}
                                                </svg>

                                                {/* Tooltip Card Overlay */}
                                                {hoveredData && (
                                                    <div
                                                        className="absolute z-50 glass-panel rounded-lg p-4 pointer-events-none min-w-[180px] animate-in fade-in zoom-in duration-200"
                                                        style={{
                                                            left: `${(hoveredData.x / 1000) * 100}%`,
                                                            top: `${(hoveredData.y / 300) * 100}%`,
                                                            transform: 'translate(-50%, -110%)'
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-3 border-b border-zinc-50 pb-2">
                                                            <span className="text-[10px] font-black text-zinc-900 font-mono italic">
                                                                {new Date(hoveredData.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')}
                                                            </span>
                                                            <span className="text-[10px] text-zinc-400 font-black">LOGGED</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Total Input</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-zinc-900 font-mono">{hoveredData.total_input}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Total Output</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-zinc-900 font-mono">{hoveredData.total_output}</span>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-2 border-t border-zinc-50 flex items-center justify-between">
                                                            <span className="text-[9px] font-black text-indigo-600 uppercase">Delta Flow</span>
                                                            <span className="text-[10px] font-black text-zinc-900">
                                                                {Math.abs(Number(hoveredData.total_output) - Number(hoveredData.total_input)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* X-Axis Dates */}
                                                <div className="flex justify-between mt-6 px-1">
                                                    {stats?.output_chart?.map((d: any, i: number) => (
                                                        <span key={i} className="text-[10px] font-bold text-zinc-400 font-mono tracking-tighter">{d.date.split('-').slice(-1)}</span>
                                                    ))}
                                                </div>

                                                {/* Legend */}
                                                <div className="flex items-center justify-center gap-8 mt-12 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Actual Output</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Total Input</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Ledger */}
                        <div className="lg:col-span-12 mt-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="glass-panel rounded-lg p-6 overflow-hidden h-fit">
                                        <h3 className="text-2xl font-bold text-zinc-800">
                                            {stats?.output_chart?.reduce((acc: number, cur: any) => acc + Number(cur.total_output), 0) || 0}
                                        </h3>
                                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-4">Weekly Cumulative Output</p>
                                        <p className="text-[10px] text-zinc-400 leading-relaxed mb-6">Total volume processed through last steps in 7-day rolling window.</p>
                                        <div className="flex items-end gap-1 h-20">
                                            {[20, 45, 30, 60, 40, 70, 50, 80, 60, 90, 75].map((h, i) => (
                                                <div key={i} className="flex-1 bg-indigo-100 group hover:bg-indigo-500 transition-colors rounded-sm" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-9 glass-panel rounded-lg overflow-hidden">
                                    <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                                <Icon icon="solar:history-bold-duotone" className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">Live Activity Registry</h3>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 bg-white px-3 py-1 rounded-full border border-zinc-200">LAST 10 Output</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-t border-zinc-100">
                                        {stats?.recent_entries?.slice(0, 10).map((entry: any, i: number) => (
                                            <div key={i} className="p-4 border-r border-b border-zinc-100 last:border-r-0 hover:bg-zinc-50/50 transition-colors group">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">LN{entry.production?.line?.name?.match(/\d+/)?.[0] || '-'}</span>
                                                    <span className="text-[8px] font-bold text-zinc-300 font-mono">{entry.production?.production_date.split('-').reverse().slice(0, 2).join('/')}</span>
                                                </div>
                                                <p className="text-[10px] font-black text-zinc-900 uppercase truncate mb-1">
                                                    {entry.lot?.gl_group?.customer?.name || 'Unknown'}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[8px] font-bold text-zinc-400">GL{entry.lot?.gl_group?.gl_number}</span>
                                                    <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                                                    <span className="text-[8px] font-black text-zinc-500 italic">LOT.{entry.lot?.lot_code?.slice(-3)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastViewport />
        </ToastProvider>
    );
}
