'use client';

import { TimeStudy } from '../../types';

interface LineBalancingChartProps {
    details: TimeStudy[];
    efficiency?: number;
    title?: string;
}

export const LineBalancingChart = ({ details, efficiency = 1, title = "Line Balancing Analysis" }: LineBalancingChartProps) => {
    // Basic metrics
    const totalSmv = details.reduce((acc, d) => acc + (d.smv || 0), 0);
    const totalMp = details.reduce((acc, d) => acc + (d.man_power || 0), 0);
    const pitchTime = (totalMp > 0 && efficiency > 0) ? (totalSmv / (totalMp * efficiency)) : 0;

    // Chart dimensions & scaling
    const cycleTimes = details.map(d => (d.smv || 0) / (d.man_power || 1));
    const maxCycleTime = cycleTimes.length > 0 ? Math.max(...cycleTimes) : 0;
    const maxSmv = Math.max(maxCycleTime, pitchTime, 0.1) * 1.2;

    return (
        <div className="lg:col-span-12 space-y-4 pt-10">
            <div className="flex items-end justify-between px-4">
                <div>
                    <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">{title}</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-2">Industrial Engineering Workflow Optimization</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Target Pitch Time</p>
                    <p className="text-3xl font-black text-blue-600 leading-none">{pitchTime.toFixed(3)} <span className="text-xs text-zinc-400 font-bold uppercase tracking-tighter">Min/Station</span></p>
                </div>
            </div>

            <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-12 shadow-2xl relative">
                <div className="flex h-[500px]">
                    {/* Y-Axis Label */}
                    <div className="w-14 flex items-center justify-center relative">
                        <span className="rotate-[-90deg] whitespace-nowrap text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] absolute">
                            Average Cycle Time / Operation (minutes)
                        </span>
                    </div>

                    {/* Chart Core Area */}
                    <div className="flex-1 flex flex-col relative border-l-2 border-b-2 border-zinc-200 ml-4 h-full">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-0">
                            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => (
                                <div key={p} className="w-full border-t border-zinc-100 flex items-start h-0">
                                    <span className="text-[9px] font-black text-zinc-300 -mt-2.5 -ml-12 w-10 text-right pr-2">
                                        {(maxSmv * (1 - p)).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Bars Area */}
                        <div className="relative flex-1 flex items-end gap-1 px-4 pb-0 overflow-x-auto no-scrollbar z-10 min-h-0">
                            {details.map((detail, idx) => {
                                const mp = detail.man_power || 1;
                                const smv = detail.smv || 0;
                                const cycleTime = smv / mp;

                                // Split Cycle Time into Handling and Machine components
                                const handlingPart = ((detail.handling_position_value || 0) / 60) / mp;
                                const machinePart = Math.max(0, cycleTime - handlingPart);

                                const totalHeight = (cycleTime / maxSmv) * 100;
                                const hHeight = (handlingPart / maxSmv) * 100;
                                const mHeight = (machinePart / maxSmv) * 100;

                                const opName = detail.operation_name || detail.operation?.name || '---';

                                return (
                                    <div key={idx} className="group relative flex flex-col items-center flex-1 min-w-[50px] max-w-[80px] h-full justify-end">
                                        {/* Tooltip */}
                                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-900 text-[10px] font-black px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl min-w-[180px] text-center border border-zinc-200">
                                            <p className="text-zinc-400 mb-1 uppercase tracking-tighter leading-tight">{opName}</p>
                                            <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-100">
                                                <span className="text-zinc-400">MP: {mp}</span>
                                                <span className="text-zinc-900 font-black">CT: {cycleTime.toFixed(3)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px]">
                                                <span className="text-blue-500 font-bold">H: {handlingPart.toFixed(3)}</span>
                                                <span className="text-fuchsia-600 font-bold">M: {machinePart.toFixed(3)}</span>
                                            </div>
                                        </div>

                                        {/* The Stacked Bar */}
                                        <div
                                            className="w-full flex flex-col justify-end transition-all duration-700 hover:brightness-110 active:scale-x-95 origin-bottom"
                                            style={{ height: `${totalHeight}%` }}
                                        >
                                            {/* Machine Time (Solid fuchsia/magenta) */}
                                            <div className="w-full bg-[#CC3399] border-x border-t border-black/20" style={{ height: `${(mHeight / totalHeight) * 100}%` }}></div>
                                            {/* Handling Time (Solid light blue) */}
                                            <div className="w-full bg-[#99CCFF] border-x border-black/20" style={{ height: `${(hHeight / totalHeight) * 100}%` }}></div>
                                        </div>

                                        {/* Table-style Labels Section */}
                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 flex flex-col border-x border-b border-zinc-200">
                                            <div className="h-44 w-full relative flex items-center justify-center overflow-hidden bg-white">
                                                <span className="rotate-[-90deg] whitespace-nowrap text-[9px] font-bold text-zinc-600 uppercase tracking-tighter w-44 text-right pr-4">
                                                    {opName}
                                                </span>
                                            </div>
                                            <div className="h-10 border-t border-zinc-200 flex items-center justify-center text-[11px] font-black text-zinc-900 bg-zinc-50 uppercase tracking-tighter">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Red Horizontal Pitch Line */}
                            {pitchTime > 0 && (
                                <div
                                    className="absolute left-0 right-0 border-t-[4px] border-red-500 z-30 pointer-events-none transition-all duration-700"
                                    style={{ bottom: `${(pitchTime / maxSmv) * 100}%` }}
                                >
                                    {/* Traditional Dot ends like in the picture */}
                                    <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-xl"></div>
                                    <div className="absolute -right-2 -top-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-xl"></div>

                                    <div className="absolute right-4 -top-8 bg-black text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                        Target: {pitchTime.toFixed(3)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Industrial Legend */}
                <div className="mt-72 flex flex-wrap justify-center gap-12 border-t-2 border-zinc-50 pt-10">
                    <div className="flex items-center gap-4 group">
                        <div className="w-6 h-6 bg-[#CC3399] rounded-sm shadow-md group-hover:scale-110 transition-transform"></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-900 leading-none mb-1">Machine Time</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Variabel Sewing Study</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-6 h-6 bg-[#99CCFF] rounded-sm shadow-md group-hover:scale-110 transition-transform"></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-900 leading-none mb-1">Handling / Pick-Up</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Fixed Manual Study</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="flex items-center">
                            <div className="w-8 h-1 bg-red-500"></div>
                            <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white -ml-1"></div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-red-600 leading-none mb-1">Target Pitch Line</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Optimum Balance Goal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balancing Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
                <div className="bg-white border-2 border-zinc-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Line Efficiency</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-zinc-900">
                            {(pitchTime > 0 && maxCycleTime > 0) ? ((totalSmv / (totalMp * maxCycleTime)) * 100).toFixed(1) : '0'}
                        </span>
                        <span className="text-xl font-bold text-zinc-300 mb-1">%</span>
                    </div>
                </div>
                <div className="bg-white border-2 border-zinc-100 p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Bottlenecks</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-red-600">
                            {details.filter(d => ((d.smv || 0) / (d.man_power || 1)) > pitchTime && pitchTime > 0).length}
                        </span>
                        <span className="text-[10px] font-black text-zinc-300 uppercase mb-2">Stations</span>
                    </div>
                </div>
                <div className="bg-zinc-900 p-8 rounded-[2rem] shadow-2xl md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">IE Recommendation</p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-tight leading-relaxed italic z-10 relative">
                        {details.filter(d => ((d.smv || 0) / (d.man_power || 1)) > pitchTime && pitchTime > 0).length > 0
                            ? "CRITICAL: Redistribute excess Cycle Time from magenta-colored stations to under-capacity operators to reach pitch target."
                            : "OPTIMAL: Line flow is healthy and synchronized. All stations are operating within the target pitch time."}
                    </p>
                </div>
            </div>
        </div>
    );
};
