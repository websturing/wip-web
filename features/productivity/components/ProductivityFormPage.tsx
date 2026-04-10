'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ProductionService } from '../../Production/services/ProductionService';
import { ReferenceService } from '../../Reference/services/ReferenceService';
import { ProductivityService } from '../services/ProductivityService';

interface LotConfig {
    lot_id: string;
    label?: string;
    smv: number;
    last_step: number;
    target_plan: number;
}

export const ProductivityFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lines, setLines] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        id: null,
        line_id: '',
        date: new Date().toISOString().split('T')[0],
        manpower: 0,
        plan_manpower: 0,
        sewer: 0,
        plan_sewer: 0,
        working_hour: 8,
        smv: 0,
        last_step: 0,
        target_plan: 0,
        is_smv_merged: true,
        is_last_step_merged: true,
        is_target_merged: true,
        lot_configs: [] as LotConfig[]
    });

    // Formula-based target suggestion (Using Manpower)
    const formulaTarget = useMemo(() => {
        const activeMp = formData.plan_manpower;
        if (activeMp > 0 && formData.working_hour > 0 && formData.smv > 0) {
            return Math.round((activeMp * formData.working_hour * 60) / formData.smv);
        }
        return 0;
    }, [formData.plan_manpower, formData.working_hour, formData.smv]);

    // Current sum of individual lot targets
    const currentTargetSum = useMemo(() => {
        return formData.lot_configs.reduce((sum, c) => sum + (c.target_plan || 0), 0);
    }, [formData.lot_configs]);

    useEffect(() => {
        ProductionService.getLines().then(res => {
            if (res.status === 'success') {
                const sortedLines = res.data
                    .map((l: any) => ({ id: l.id, label: l.name }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
                setLines(sortedLines);
            }
        });
        ReferenceService.getLotList().then(res => {
            if (res.status === 'success') {
                const sortedLots = res.data
                    .map((l: any) => ({
                        id: l.id,
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
                setLots(sortedLots);
            }
        });

        if (id && typeof id === 'string') {
            setIsLoading(true);
            ProductivityService.getById(id).then(res => {
                if (res.status === 'success' && res.data) {
                    const item = res.data;
                    const configs = item.lots ? item.lots.map((l: any) => ({
                        lot_id: l.id,
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`,
                        smv: l.pivot?.smv || 0,
                        last_step: l.pivot?.last_step || 0,
                        target_plan: l.pivot?.target_plan || 0
                    })) : [];

                    const anyDiffSmv = configs.some((c: any) => c.smv !== configs[0]?.smv);
                    const anyDiffStep = configs.some((c: any) => c.last_step !== configs[0]?.last_step);
                    const anyDiffTarget = configs.some((c: any) => c.target_plan !== configs[0]?.target_plan);

                    setFormData({
                        id: item.id,
                        line_id: item.line_id,
                        date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
                        manpower: item.manpower,
                        plan_manpower: item.plan_manpower || 0,
                        sewer: item.sewer || 0,
                        plan_sewer: item.plan_sewer || 0,
                        working_hour: item.working_hour,
                        smv: item.smv || configs[0]?.smv || 0,
                        last_step: item.last_step || configs[0]?.last_step || 0,
                        target_plan: item.target_plan || configs.reduce((a: number, b: any) => a + b.target_plan, 0) || 0,
                        is_smv_merged: !anyDiffSmv,
                        is_last_step_merged: !anyDiffStep,
                        is_target_merged: !anyDiffTarget,
                        lot_configs: configs
                    });
                }
            }).finally(() => setIsLoading(false));
        }
    }, [id]);

    const handleLotSelection = async (ids: (string | number)[]) => {
        const prevLotIds = formData.lot_configs.map(c => c.lot_id);
        const newConfigs = [...formData.lot_configs];
        const finalConfigs = newConfigs.filter(c => ids.includes(c.lot_id));
        const addedIds = ids.filter(id => !prevLotIds.includes(String(id)));

        for (const lotId of addedIds) {
            const lotInfo = lots.find(l => l.id === lotId);
            let defaults = { smv: 0, last_step: 0, target_plan: 0, plan_manpower: 0, sewer: 0, plan_sewer: 0 };

            try {
                const res = await ProductivityService.getLastInfo(String(lotId));
                if (res.status === 'success' && res.data) {
                    defaults = {
                        smv: res.data.smv || 0,
                        last_step: 0,
                        target_plan: res.data.target_plan || 0,
                        plan_manpower: res.data.plan_manpower || 0,
                        sewer: res.data.sewer || 0,
                        plan_sewer: 0
                    };

                    setFormData(prev => ({
                        ...prev,
                        plan_manpower: (prev.plan_manpower === 0) ? defaults.plan_manpower : prev.plan_manpower,
                        smv: (prev.is_smv_merged && prev.smv === 0) ? defaults.smv : prev.smv,
                        target_plan: (prev.is_target_merged && prev.target_plan === 0) ? defaults.target_plan : prev.target_plan
                    }));
                }
            } catch (e) { }

            finalConfigs.push({
                lot_id: String(lotId),
                label: lotInfo?.label,
                smv: defaults.smv,
                last_step: defaults.last_step,
                target_plan: defaults.target_plan
            });
        }
        setFormData(prev => ({ ...prev, lot_configs: finalConfigs }));
    };

    const updateLotConfig = (lotId: string, field: keyof LotConfig, value: number) => {
        setFormData(prev => {
            const nextConfigs = prev.lot_configs.map(c => c.lot_id === lotId ? { ...c, [field]: value } : c);
            return { ...prev, lot_configs: nextConfigs };
        });
    };

    const applyGlobalTarget = (val: number) => {
        setFormData(prev => {
            const count = prev.lot_configs.length || 1;
            const perLot = Math.round(val / count);
            return {
                ...prev,
                target_plan: val,
                lot_configs: prev.lot_configs.map(c => ({ ...c, target_plan: perLot }))
            };
        });
    };

    const handleSave = async () => {
        if (!formData.line_id || formData.lot_configs.length === 0) {
            alert('Selection required: Line & Styles');
            return;
        }

        setIsSaving(true);
        try {
            const lotData = formData.lot_configs.map(c => ({
                lot_id: c.lot_id,
                smv: formData.is_smv_merged ? formData.smv : c.smv,
                last_step: formData.is_last_step_merged ? formData.last_step : c.last_step,
                target_plan: c.target_plan
            }));

            const payload = { ...formData, lot_data: lotData };
            const res = await ProductivityService.save(payload);
            if (res.status === 'success') router.push('/admin/productivity');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Error saving data.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-700 ">
            {/* Standard Page Header */}
            <div className="flex items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:chart-square-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Productivity Form</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Resource Allocation & Performance Log</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="h-12 px-6 bg-white border border-zinc-200 text-zinc-500 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                        <Icon icon="solar:undo-left-bold" className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                    {(formData.id || currentTargetSum > 0) && (
                        <div className="flex flex-col items-end px-6 border-l border-zinc-200 py-1">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Target Sum</span>
                            <span className="text-2xl font-black text-zinc-900 tracking-tighter tabular-nums leading-none mt-1">{currentTargetSum}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Identification & Core Resources */}
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 relative">
                    <div className="flex gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Event Date</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 h-12 rounded-2xl px-5 text-sm font-bold outline-none focus:border-zinc-900 transition-all font-mono" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Assigned Line</label>
                            <Select
                                options={lines}
                                value={formData.line_id}
                                onChange={(val) => setFormData({ ...formData, line_id: String(val) })}
                                placeholder="Select Center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">GL (Style Reference)</label>
                            <MultiSelect
                                options={lots}
                                value={formData.lot_configs.map(c => c.lot_id)}
                                onChange={handleLotSelection}
                                placeholder="Search GL..."
                            />
                        </div>
                    </div>

                    {/* Separate MP and Matching Girl sections */}
                    <div className="flex gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Plan Man Power</label>
                            <input type="number" step="0.5" value={formData.plan_manpower} onChange={(e) => setFormData({ ...formData, plan_manpower: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-500 outline-none focus:border-zinc-900" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Actual Man Power
                            </label>
                            <input type="number" step="0.5" value={formData.manpower} onChange={(e) => setFormData({ ...formData, manpower: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="w-full bg-blue-50/30 border border-blue-100 h-14 rounded-2xl px-5 text-lg font-black text-blue-700 outline-none shadow-sm focus:border-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actual Matching Girl
                            </label>
                            <input type="number" step="0.5" value={formData.sewer} onChange={(e) => setFormData({ ...formData, sewer: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="w-full bg-emerald-50/30 border border-emerald-100 h-14 rounded-2xl px-5 text-lg font-black text-emerald-700 outline-none shadow-sm focus:border-emerald-400" />
                        </div>
                    </div>
                </div>

                {/* Intelligence & Global Controls */}
                <div className="bg-zinc-900 rounded-[3rem] p-10 text-white grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>

                    <div className="lg:col-span-12 space-y-6 relative z-10 lg:border-r lg:border-white/10 pr-10">
                        <div className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                    <Icon icon="solar:programming-bold-duotone" className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] leading-none">Logic Optimization</h3>
                                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2">Data Synchronization Active</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5">
                                <button onClick={() => setFormData(p => ({ ...p, is_smv_merged: !p.is_smv_merged }))} className={cn("px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-2", formData.is_smv_merged ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10")}>SMV</button>
                                <button onClick={() => setFormData(p => ({ ...p, is_last_step_merged: !p.is_last_step_merged }))} className={cn("px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-2", formData.is_last_step_merged ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10")}>Step</button>
                                <button onClick={() => setFormData(p => ({ ...p, is_target_merged: !p.is_target_merged }))} className={cn("px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-2", formData.is_target_merged ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10")}>Target</button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-10 items-end relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Shift Duration</label>
                            <input type="number" step="0.5" value={formData.working_hour} onChange={(e) => setFormData({ ...formData, working_hour: Number(e.target.value) })} onFocus={(e) => e.target.select()} className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-6 text-sm font-black text-white outline-none focus:bg-white/10 focus:border-white/20 transition-all font-mono" />
                        </div>

                        <div className="space-y-3">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", formData.is_target_merged ? "text-emerald-400" : "text-white/20")}>Global Target Plan</label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={formData.is_target_merged ? formData.target_plan : currentTargetSum}
                                    onChange={(e) => applyGlobalTarget(Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    disabled={!formData.is_target_merged}
                                    className={cn("w-full h-14 rounded-2xl px-6 text-lg font-black outline-none transition-all placeholder:text-white/10", formData.is_target_merged ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed")}
                                />
                                {formData.is_target_merged && (
                                    <button
                                        onClick={() => applyGlobalTarget(formulaTarget)}
                                        className="absolute right-2 top-2 h-10 px-3 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-black rounded-xl transition-all flex items-center gap-2 shadow-2xl active:scale-90"
                                    >
                                        <Icon icon="solar:calculator-bold" className="w-4 h-4" />
                                        <span>Use {formulaTarget}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", formData.is_smv_merged ? "text-emerald-400" : "text-white/20")}>Consolidated SMV</label>
                            <input
                                type="number"
                                step="0.001"
                                value={formData.smv}
                                onChange={(e) => setFormData({ ...formData, smv: Number(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                disabled={!formData.is_smv_merged}
                                className={cn("w-full h-14 rounded-2xl px-6 text-lg font-black outline-none transition-all", formData.is_smv_merged ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed")}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={cn("text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors", formData.is_last_step_merged ? "text-emerald-400" : "text-white/20")}>Global Seq Step</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.last_step}
                                onChange={(e) => setFormData({ ...formData, last_step: Number(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                disabled={!formData.is_last_step_merged}
                                className={cn("w-full h-14 rounded-2xl px-6 text-lg font-black outline-none transition-all", formData.is_last_step_merged ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed")}
                            />
                        </div>
                    </div>
                </div>

                {/* Grid of Styles */}
                <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                    <div className="p-8 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-8 bg-purple-500 rounded-full"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">Garment Style Breakdown</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/30">
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-1/4">Style Orientation</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Style Target</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Specific SMV</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Sequence Step</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.lot_configs.map((config, idx) => (
                                    <tr key={config.lot_id} className="border-t border-zinc-50 hover:bg-zinc-50/50 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-400 group-hover:bg-purple-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-black text-zinc-900 uppercase tracking-tight">{config.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className="relative inline-block">
                                                <input
                                                    type="number"
                                                    value={config.target_plan}
                                                    onChange={(e) => updateLotConfig(config.lot_id, 'target_plan', Number(e.target.value))}
                                                    onFocus={(e) => e.target.select()}
                                                    className={cn("w-36 h-12 rounded-2xl px-4 text-center text-sm font-black outline-none border transition-all", formData.is_target_merged ? "bg-zinc-50 border-zinc-100 text-zinc-300" : "bg-white border-zinc-200 text-zinc-900 focus:border-zinc-900 focus:shadow-lg")}
                                                />
                                                {formData.is_target_merged && <div className="absolute top-0 right-0 -mr-2 -mt-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-0"><Icon icon="solar:check-read-bold" className="w-3 h-3 text-white" /></div>}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={config.smv}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'smv', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                disabled={formData.is_smv_merged}
                                                className={cn("w-32 h-12 rounded-2xl px-4 text-center text-sm font-black outline-none border transition-all", formData.is_smv_merged ? "bg-zinc-50 border-zinc-100 text-zinc-300" : "bg-white border-zinc-200 text-blue-600 focus:border-blue-500 focus:shadow-lg")}
                                            />
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={config.last_step}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'last_step', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                disabled={formData.is_last_step_merged}
                                                className={cn("w-32 h-12 rounded-2xl px-4 text-center text-sm font-black outline-none border transition-all", formData.is_last_step_merged ? "bg-zinc-50 border-zinc-100 text-zinc-300" : "bg-white border-zinc-200 text-emerald-600 focus:border-emerald-500 focus:shadow-lg")}
                                            />
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => handleLotSelection(formData.lot_configs.map(c => c.lot_id).filter(id => id !== config.lot_id))}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 active:scale-75"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {formData.lot_configs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center opacity-10">
                                            <Icon icon="solar:box-minimalistic-bold-duotone" className="w-20 h-20 mx-auto mb-6" />
                                            <p className="text-[12px] font-black uppercase tracking-[0.5em]">No Styles in Pipeline</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Final Submit Button at Bottom */}
                <div className="flex items-center justify-end gap-6 pt-12 border-t border-zinc-100">
                    <button onClick={() => router.back()} className="h-16 px-10 text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-zinc-900 transition-colors">
                        Discard Changes
                    </button>
                    <Button onClick={handleSave} disabled={isSaving} className="h-16 px-20 bg-zinc-900 hover:bg-black text-white rounded-[1.5rem] shadow-2xl active:scale-95 transition-all text-sm font-black uppercase tracking-widest group flex items-center gap-3">
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Icon icon="solar:cloud-upload-bold-duotone" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span>Save Productivity Record</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
