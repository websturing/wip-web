
export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <header>
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                    Dashboard <span className="text-blue-600 font-mono tracking-widest italic">Overview</span>
                </h1>
                <p className="mt-2 text-sm text-zinc-500 font-medium tracking-tight">
                    Real-time performance metrics and industrial engineering data.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Layouts', value: '42', change: '+12%', color: 'blue' },
                    { label: 'Total Operations', value: '1.2k', change: '+0.5%', color: 'purple' },
                    { label: 'Avg Efficiency', value: '89%', change: '-2%', color: 'green' },
                    { label: 'Cycle Time', value: '4.2s', change: '-5%', color: 'orange' },
                ].map((stat, i) => (
                    <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95 group cursor-pointer">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-blue-600 transition-colors">
                            {stat.label}
                        </p>
                        <div className="mt-4 flex items-baseline justify-between gap-4">
                            <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                {stat.value}
                            </span>
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'} italic font-mono`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <section className="p-10 bg-white dark:bg-zinc-900 rounded-[3.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter decoration-blue-600 underline underline-offset-8">
                        System Efficiency
                    </h3>
                    <div className="flex gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Feed</span>
                    </div>
                </div>

                <div className="h-64 flex items-end gap-3 px-4">
                    {[40, 70, 45, 90, 65, 80, 55, 100, 85, 75, 40, 60].map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded-full transition-all hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30"
                        ></div>
                    ))}
                </div>
            </section>
        </div>
    );
}
