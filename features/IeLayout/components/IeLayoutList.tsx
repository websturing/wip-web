'use client';

import { useIeLayout } from '../hooks/useIeLayout';

export const IeLayoutList = () => {
    const { data, isLoading, error, deleteLayout } = useIeLayout();

    if (isLoading) return (
        <div className="p-20 flex flex-col items-center gap-4 animate-pulse">
            <div className="h-1.5 w-40 bg-zinc-100 rounded-full"></div>
            <div className="h-1.5 w-24 bg-zinc-50 rounded-full"></div>
        </div>
    );

    if (error) return (
        <div className="p-10 text-center bg-red-50 text-red-500 rounded-2xl border border-red-100 text-[10px] font-black uppercase tracking-widest">
            Error: {error.message}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10 bg-white">
            {data?.length > 0 ? (
                data.map((layout) => (
                    <div
                        key={layout.id}
                        className="group relative p-8 bg-zinc-50/50 hover:bg-white rounded-[2rem] border border-transparent hover:border-zinc-100 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 tracking-tight lowercase group-hover:text-blue-600 transition-colors">
                                    {layout.name}
                                </h3>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        {layout.department}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-white border border-zinc-100 text-[9px] font-black text-zinc-300 rounded-full uppercase tracking-tighter">
                                #{layout.id}
                            </span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-zinc-50 shadow-sm">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pricing</span>
                                <span className="font-extrabold text-[#1a1a1a] text-lg">${layout.price}</span>
                            </div>

                            {layout.is_gl_number && (
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Serial GL</span>
                                    <span className="text-xs font-black font-mono text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-lg tracking-widest">
                                        {layout.gl_number}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-zinc-100 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            <button className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] bg-zinc-900 text-white rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-all">
                                Open Details
                            </button>
                            <button
                                onClick={() => deleteLayout(layout.id)}
                                className="px-4 py-3.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all group/del"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full p-24 bg-zinc-50 border border-dashed border-zinc-100 rounded-[3rem] text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-zinc-200 border border-zinc-50 shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">No Industrial Engineering Layouts Found</p>
                    <button className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4">Initialization Required</button>
                </div>
            )}
        </div>
    );
};
