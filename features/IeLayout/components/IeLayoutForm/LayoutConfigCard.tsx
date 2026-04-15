'use client';

import { Icon } from '@/app/components/ui/Icon';
import { Select } from '@/app/components/ui/Select';
import { IeLayout } from '../../types';

interface LayoutConfigCardProps {
    formData: Partial<IeLayout>;
    lots: { id: string, lot_code: string }[];
    updateFormData: (data: Partial<IeLayout>) => void;
}

export const LayoutConfigCard = ({ formData, lots, updateFormData }: LayoutConfigCardProps) => {
    return (
        <div className="lg:col-span-12">
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-10 lg:p-14 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Icon icon="solar:pen-new-square-bold-duotone" className="w-4 h-4 text-zinc-900" />
                            Layout Identity
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. basic_tshirt_v1"
                            className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-zinc-900 placeholder:text-zinc-200 placeholder:lowercase focus:ring-2 focus:ring-zinc-900/5 transition-all lowercase"
                            value={formData.name}
                            onChange={(e) => updateFormData({ name: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Icon icon="solar:link-bold-duotone" className="w-4 h-4 text-blue-500" />
                            Target Architecture
                        </label>
                        <Select
                            value={formData.lot_id || ''}
                            onChange={(val) => updateFormData({ lot_id: String(val) })}
                            placeholder="select lot link"
                            options={lots.map(l => ({ label: l.lot_code, id: l.id }))}
                            className="h-[52px] rounded-2xl bg-zinc-50 border-none font-black text-xs text-zinc-900 px-6"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Icon icon="solar:bolt-bold-duotone" className="w-4 h-4 text-emerald-500" />
                            Efficiency Factor
                        </label>
                        <div className="relative">
                            <input
                                type="number" step="0.01"
                                className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                value={formData.efficiency_constant}
                                onChange={(e) => updateFormData({ efficiency_constant: Number(e.target.value) })}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-300">LIMIT</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Icon icon="solar:tag-price-bold-duotone" className="w-4 h-4 text-indigo-500" />
                            Target Price
                        </label>
                        <input
                            type="number"
                            className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                            value={formData.price}
                            onChange={(e) => updateFormData({ price: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
