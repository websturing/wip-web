'use client';

import { IeLayoutList } from './components/IeLayoutList';

export default function IeLayoutPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Minimalist Header for IE Layouts */}
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-[2.2rem] font-bold text-zinc-900 tracking-tight lowercase">
                        ie <span className="text-blue-500 font-extrabold italic">layouts.</span>
                    </h1>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            Industrial Engineering Analytics
                        </p>
                    </div>
                </div>

                <button className="px-6 py-4 bg-[#1a1a1a] text-white rounded-xl font-bold text-[13px] tracking-tight hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                    Add New Layout
                </button>
            </header>

            {/* List Section managed within feature */}
            <section className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                <IeLayoutList />
            </section>
        </div>
    );
}
