'use client';

import { Icon } from '@/app/components/ui/Icon';
import { IeLayout } from '../../types';

interface FormFooterSummaryProps {
    formData: Partial<IeLayout>;
}

export const FormFooterSummary = ({ formData }: FormFooterSummaryProps) => {
    const formatInt = (val: number = 0) => Math.round(val).toLocaleString();

    const totalSmv = (formData.details || []).reduce((acc, d) => acc + (d.smv || 0), 0);
    const totalMp = (formData.details || []).reduce((acc, d) => acc + (d.man_power || 0), 0);
    const eff = formData.efficiency_constant || 1;
    const lineOutput = totalSmv > 0 ? (totalMp * 60 * eff * 8) / totalSmv : 0;

    return (
        <div className="lg:col-span-12 mt-12 mb-10">
            <div className="bg-zinc-900 text-white rounded-[2.5rem] px-6 lg:px-12 py-6 lg:py-8 shadow-2xl flex flex-col md:flex-row items-center justify-between border border-white/10 relative overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                <div className="flex items-center gap-10 relative z-10 w-full md:w-auto overflow-x-auto no-scrollbar py-2">
                    <div className="flex flex-col min-w-max">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Architecture Productivity</span>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-black text-white">
                                {formatInt(lineOutput)}
                            </span>
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Units / Line / Day</span>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-12 bg-white/10"></div>

                    <div className="flex flex-col min-w-max">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Manpower Metric</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-blue-400">{totalMp}</span>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Total Headcount</span>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-12 bg-white/10"></div>

                    <div className="flex flex-col min-w-max">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Cycle Complexity</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-zinc-100">{totalSmv.toFixed(2)}</span>
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Total SMV</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 md:mt-0 relative z-10 w-full md:w-auto">
                    <div className="bg-white/5 border border-white/10 p-2 rounded-2xl flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6 text-white" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">System Synced</p>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Ready for production deployment</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
