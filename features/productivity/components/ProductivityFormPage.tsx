'use client';

import { DatePicker } from '@/app/components/ui/DatePicker';
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
        const activeMp = Number(formData.plan_manpower);
        const smv = Number(formData.smv);
        if (activeMp > 0 && formData.working_hour > 0 && smv > 0) {
            return Math.round((activeMp * formData.working_hour * 60) / smv);
        }
        return 0;
    }, [formData.plan_manpower, formData.working_hour, formData.smv]);

    // Current sum of individual lot targets
    const currentTargetSum = useMemo(() => {
        return formData.lot_configs.reduce((sum, c) => sum + (Number(c.target_plan) || 0), 0);
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
                        smv: parseFloat(l.pivot?.smv || 0),
                        last_step: parseFloat(l.pivot?.last_step || 0),
                        target_plan: parseFloat(l.pivot?.target_plan || 0)
                    })) : [];

                    const anyDiffSmv = configs.some((c: any) => c.smv !== configs[0]?.smv);
                    const anyDiffStep = configs.some((c: any) => c.last_step !== configs[0]?.last_step);
                    const anyDiffTarget = configs.some((c: any) => c.target_plan !== configs[0]?.target_plan);

                    setFormData({
                        id: item.id,
                        line_id: item.line_id,
                        date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
                        manpower: parseFloat(item.manpower || 0),
                        plan_manpower: parseFloat(item.plan_manpower || 0),
                        sewer: parseFloat(item.sewer || 0),
                        plan_sewer: parseFloat(item.plan_sewer || 0),
                        working_hour: parseFloat(item.working_hour || 8),
                        smv: parseFloat(item.smv || configs[0]?.smv || 0),
                        last_step: parseFloat(item.last_step || configs[0]?.last_step || 0),
                        target_plan: parseFloat(item.target_plan || configs.reduce((a: number, b: any) => a + b.target_plan, 0) || 0),
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
                        smv: parseFloat(res.data.smv || 0),
                        last_step: 0,
                        target_plan: parseFloat(res.data.target_plan || 0),
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
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
            if (res.status === 'success') router.push(`/admin/productivity?date=${formData.date}`);
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
                    <div className="flex flex-wrap gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Event Date</label>
                            <DatePicker
                                value={formData.date}
                                onChange={(val) => setFormData({ ...formData, date: val })}
                                className="w-[200px]"
                            />
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
                    <div className="flex flex-wrap gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Plan Man Power</label>
                            <input
                                type="text"
                                value={formData.plan_manpower}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                    setFormData({ ...formData, plan_manpower: val as any });
                                }}
                                onBlur={() => setFormData(p => ({ ...p, plan_manpower: Number(p.plan_manpower) || 0 }))}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-500 outline-none focus:border-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Actual Man Power
                            </label>
                            <input
                                type="text"
                                value={formData.manpower}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                    setFormData({ ...formData, manpower: val as any });
                                }}
                                onBlur={() => setFormData(p => ({ ...p, manpower: Number(p.manpower) || 0 }))}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-blue-50/30 border border-blue-100 h-14 rounded-2xl px-5 text-lg font-black text-blue-700 outline-none shadow-sm focus:border-blue-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actual Matching Girl
                            </label>
                            <input
                                type="text"
                                value={formData.sewer}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                    setFormData({ ...formData, sewer: val as any });
                                }}
                                onBlur={() => setFormData(p => ({ ...p, sewer: Number(p.sewer) || 0 }))}
                                onFocus={(e) => e.target.select()}
                                className="w-full bg-emerald-50/30 border border-emerald-100 h-14 rounded-2xl px-5 text-lg font-black text-emerald-700 outline-none shadow-sm focus:border-emerald-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Intelligence & Global Controls */}
                <div className="bg-zinc-900 rounded-[3rem] p-10 text-white grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full -mr-64 -mt-64 blur-[120px]"></div>

                    <div className="lg:col-span-4 space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <Icon icon="solar:programming-bold-duotone" className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight uppercase">Master Intelligence</h3>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed font-medium">Define parameters across all styles. Toggle merge to apply values globally or drill down for individual styling.</p>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Global SMV */}
                        <div className={cn(
                            "group p-6 rounded-[2rem] border transition-all duration-500",
                            formData.is_smv_merged ? "bg-white/5 border-white/10" : "bg-zinc-800/10 border-zinc-800/20 opacity-40 shadow-inner"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global SMV</label>
                                <button
                                    onClick={() => setFormData({ ...formData, is_smv_merged: !formData.is_smv_merged })}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                        formData.is_smv_merged ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/10 text-white/40"
                                    )}
                                >
                                    {formData.is_smv_merged ? 'Merged' : 'Split'}
                                </button>
                            </div>
                            <input
                                type="text"
                                disabled={!formData.is_smv_merged}
                                value={formData.smv}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                    setFormData({ ...formData, smv: val as any });
                                }}
                                onBlur={() => setFormData(p => ({ ...p, smv: Number(p.smv) || 0 }))}
                                className="bg-transparent text-2xl font-black outline-none w-full tabular-nums"
                            />
                        </div>

                        {/* Global Last Step */}
                        <div className={cn(
                            "group p-6 rounded-[2rem] border transition-all duration-500",
                            formData.is_last_step_merged ? "bg-white/5 border-white/10" : "bg-zinc-800/10 border-zinc-800/20 opacity-40 shadow-inner"
                        )}>
                            <div className="flex justify-between items-start mb-4">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Step</label>
                                <button
                                    onClick={() => setFormData({ ...formData, is_last_step_merged: !formData.is_last_step_merged })}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                        formData.is_last_step_merged ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/10 text-white/40"
                                    )}
                                >
                                    {formData.is_last_step_merged ? 'Merged' : 'Split'}
                                </button>
                            </div>
                            <input
                                type="number"
                                disabled={!formData.is_last_step_merged}
                                value={formData.last_step}
                                onChange={(e) => setFormData({ ...formData, last_step: Number(e.target.value) })}
                                className="bg-transparent text-2xl font-black outline-none w-full tabular-nums"
                            />
                        </div>

                        {/* Global Target */}
                        <div className={cn(
                            "group p-6 rounded-[2rem] border transition-all duration-500",
                            formData.is_target_merged ? "bg-emerald-500 shadow-2xl shadow-emerald-500/20 border-transparent text-white" : "bg-zinc-800/10 border-zinc-800/20 opacity-40 shadow-inner"
                        )}>
                            <div className="flex justify-between items-start mb-4 text-white/50">
                                <label className="text-[10px] font-black uppercase tracking-widest">Global Target</label>
                                <button
                                    onClick={() => setFormData({ ...formData, is_target_merged: !formData.is_target_merged })}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                        formData.is_target_merged ? "bg-white/20 text-white" : "bg-white/10 text-white/40"
                                    )}
                                >
                                    {formData.is_target_merged ? 'Merged' : 'Split'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    disabled={!formData.is_target_merged}
                                    value={formData.target_plan}
                                    onChange={(e) => applyGlobalTarget(Number(e.target.value))}
                                    className="bg-transparent text-2xl font-black outline-none w-full tabular-nums text-white"
                                />
                                {formData.is_target_merged && formulaTarget > 0 && (
                                    <button
                                        onClick={() => applyGlobalTarget(formulaTarget)}
                                        className="p-2 rounded-xl bg-white/10 hover:bg-white text-white hover:text-emerald-500 transition-all shadow-sm"
                                        title={`Apply suggested: ${formulaTarget}`}
                                    >
                                        <Icon icon="solar:magic-stick-3-bold" className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Individual Styles Drill-down */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Operational Breakdown</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {formData.lot_configs.map((config) => (
                            <div key={config.lot_id} className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm group hover:border-zinc-900 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setFormData({ ...formData, lot_configs: formData.lot_configs.filter(c => c.lot_id !== config.lot_id) })} className="text-zinc-500 hover:text-red-500">
                                        <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 italic">Lot Configuration</p>
                                    <h4 className="text-lg font-black text-zinc-900 tracking-tight leading-none truncate">{config.label}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">SMV</label>
                                        <input
                                            type="text"
                                            disabled={formData.is_smv_merged}
                                            value={formData.is_smv_merged ? formData.smv : config.smv}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                                updateLotConfig(config.lot_id, 'smv', val as any);
                                            }}
                                            onBlur={() => {
                                                if (!formData.is_smv_merged) updateLotConfig(config.lot_id, 'smv', Number(config.smv) || 0);
                                            }}
                                            className={cn("w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold tabular-nums outline-none", !formData.is_smv_merged ? "focus:border-zinc-900 border border-zinc-100" : "opacity-40 cursor-not-allowed")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Step</label>
                                        <input
                                            type="number"
                                            disabled={formData.is_last_step_merged}
                                            value={formData.is_last_step_merged ? formData.last_step : config.last_step}
                                            onChange={(e) => updateLotConfig(config.lot_id, 'last_step', Number(e.target.value))}
                                            className={cn("w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold tabular-nums outline-none", !formData.is_last_step_merged ? "focus:border-zinc-900 border border-zinc-100" : "opacity-40 cursor-not-allowed")}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                                            <span>Target Plan (PCS)</span>
                                            {!formData.is_target_merged && (
                                                <Icon icon="solar:pen-bold" className="w-3 h-3 text-emerald-500" />
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            disabled={formData.is_target_merged}
                                            value={formData.is_target_merged ? Math.round(formData.target_plan / formData.lot_configs.length) : config.target_plan}
                                            onChange={(e) => updateLotConfig(config.lot_id, 'target_plan', Number(e.target.value))}
                                            className={cn("w-full bg-emerald-50/20 h-16 rounded-2xl px-6 text-xl font-black text-emerald-600 tabular-nums outline-none", !formData.is_target_merged ? "focus:border-emerald-500 border border-emerald-100 shadow-sm" : "opacity-40 cursor-not-allowed")}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-16 px-12 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-zinc-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                        )}
                        <span>{formData.id ? 'Authorize Updates' : 'Commit Intelligence'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
