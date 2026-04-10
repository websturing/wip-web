'use client';

import { Icon } from '@/app/components/ui/Icon';
import { useWip } from '../hooks/useWip';

export const Wip = () => {
    const { data, isLoading } = useWip();

    if (isLoading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-zinc-100 transition-all">
            <div className="flex items-center gap-4 mb-6 text-[#111827]">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <Icon icon="solar:bolt-bold-duotone" className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Wip</h2>
                    <p className="text-zinc-500 text-xs font-medium">Part of Wip module</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Content Placeholder */}
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:box-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Workspace</span>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:chart-2-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Analytics</span>
                </div>
                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed min-h-[160px] flex flex-col items-center justify-center text-zinc-400 group hover:border-blue-200 transition-colors">
                    <Icon icon="solar:user-rounded-bold-duotone" className="w-6 h-6 mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Collaborators</span>
                </div>
            </div>
        </div>
    );
};
