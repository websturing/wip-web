'use client';

import { MediaPicker } from '@/app/components/MediaPicker';
import { DatePicker } from '@/app/components/ui/DatePicker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
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
    manpower: number;
    plan_manpower: number;
    sewer: number;
    plan_sewer: number;
    working_hour: number;
    section?: string;
    actual_output?: number;
    media_id?: string;
    media_url?: string;
}

export const ProductivityFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lines, setLines] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        line_id: '',
        date: (() => {
            const spDate = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('date') : null;
            if (spDate) return spDate;

            const date = new Date();
            date.setDate(date.getDate() - 1);
            return date.toISOString().split('T')[0];
        })(),
        sewer: 1,
        lot_configs: [] as LotConfig[]
    });
    const [pickingMediaFor, setPickingMediaFor] = useState<string | null>(null);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [lastSynced, setLastSynced] = useState({ line_id: '', date: '' });
    const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);

    // Total target sum across all lots
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
                    // Re-combine lots that have identical pivot values (indicating they were a combined unit)
                    const rawConfigs = item.lots ? item.lots.map((l: any) => ({
                        lot_id: String(l.id),
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`,
                        smv: parseFloat(l.pivot?.smv || 0),
                        last_step: parseFloat(l.pivot?.last_step || 0),
                        target_plan: parseFloat(l.pivot?.target_plan || 0),
                        manpower: parseFloat(l.pivot?.manpower || 0),
                        plan_manpower: parseFloat(l.pivot?.plan_manpower || 0),
                        sewer: parseFloat(l.pivot?.sewer || 0),
                        plan_sewer: parseFloat(l.pivot?.plan_sewer || 0),
                        working_hour: parseFloat(l.pivot?.working_hour || 8),
                        section: l.pivot?.section || 'all',
                        media_id: l.pivot?.media_id,
                        media_url: l.pivot?.media_url || l.pivot?.media?.url
                    })) : [];

                    // Group by pivot values hash
                    const grouped: Record<string, any> = {};
                    rawConfigs.forEach((c: any) => {
                        const hash = `${c.smv}-${c.last_step}-${c.target_plan}-${c.manpower}-${c.plan_manpower}-${c.sewer}-${c.working_hour}-${c.section}-${c.media_id}`;
                        if (!grouped[hash]) {
                            grouped[hash] = { ...c };
                        } else {
                            grouped[hash].lot_id += `,${c.lot_id}`;
                            grouped[hash].label += ` + ${c.label}`;
                        }
                    });
                    const configs = Object.values(grouped);

                    setFormData({
                        id: item.id,
                        line_id: item.line_id,
                        date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
                        sewer: parseFloat(item.sewer || 0),
                        lot_configs: configs as LotConfig[]
                    });
                    setLastSynced({
                        line_id: item.line_id,
                        date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
                    });
                }
            }).finally(() => setIsLoading(false));
        }
    }, [id]);

    // Auto-fill GLs from Production Output if line is selected
    useEffect(() => {
        if (formData.line_id === lastSynced.line_id && formData.date === lastSynced.date) return;
        if (!formData.line_id || !formData.date || lots.length === 0) return;

        const autoFillStyles = async () => {
            setIsAutoFilling(true);
            try {
                const res = await ProductionService.getAll(formData.date);
                if (res.status === 'success') {
                    const lineOutput = res.data.filter((p: any) => String(p.line_id) === String(formData.line_id));

                    const lotSectionPairs = lineOutput.flatMap((p: any) => {
                        const items = p.items || [];
                        return items.map((i: any) => ({
                            lot_id: String(i.lot_id),
                            section: i.section || 'all'
                        }));
                    }).filter(Boolean);

                    const uniquePairs = Array.from(
                        new Set(lotSectionPairs.map((p: any) => JSON.stringify(p)))
                    ).map((s: any) => JSON.parse(s) as { lot_id: string, section: string });

                    await handleLotSectionAutoFill(uniquePairs);

                    const totalMatching = lineOutput.reduce((sum: number, p: any) => sum + (Number(p.man_power_matching) || 0), 0);

                    // Group output by lot_id and section to match configs
                    const outputSummary: Record<string, number> = {};
                    lineOutput.forEach((p: any) => {
                        p.items?.forEach((i: any) => {
                            const key = `${i.lot_id}|${i.section || 'all'}`;
                            const qty = (i.details || []).reduce((s: number, d: any) => s + (Number(d.qty_output) || 0), 0);
                            // Use max instead of sum for productivity sync if needed
                            outputSummary[key] = Math.max(outputSummary[key] || 0, qty);
                        });
                    });

                    if (totalMatching > 0) {
                        setFormData(prev => ({
                            ...prev,
                            sewer: totalMatching,
                            lot_configs: prev.lot_configs.map((c, i) => {
                                const key = `${c.lot_id}|${c.section || 'all'}`;
                                return {
                                    ...c,
                                    sewer: i === 0 ? totalMatching : c.sewer,
                                    actual_output: outputSummary[key] || 0
                                };
                            })
                        }));
                    } else {
                        // Still update actual_output even if matching is 0
                        setFormData(prev => ({
                            ...prev,
                            lot_configs: prev.lot_configs.map((c) => {
                                const key = `${c.lot_id}|${c.section || 'all'}`;
                                return {
                                    ...c,
                                    actual_output: outputSummary[key] || 0
                                };
                            })
                        }));
                    }

                    setLastSynced({ line_id: formData.line_id, date: formData.date });
                }
            } catch (error) {
                console.error('Failed to auto-select styles:', error);
            } finally {
                setIsAutoFilling(false);
            }
        };

        autoFillStyles();
    }, [formData.line_id, formData.date, lots, lastSynced]);

    const handleLotSectionAutoFill = async (pairs: { lot_id: string, section: string }[]) => {
        const configs = await Promise.all(pairs.map(async (pair) => {
            const lotInfo = lots.find(l => String(l.id) === String(pair.lot_id));
            let defaults = {
                smv: 0,
                last_step: 0,
                target_plan: 0,
                manpower: 0,
                plan_manpower: 0,
                sewer: 0,
                plan_sewer: 0,
                working_hour: 8,
                section: pair.section,
                actual_output: 0,
                media_id: undefined as string | undefined,
                media_url: undefined as string | undefined
            };

            try {
                const res = await ProductivityService.getLastInfo(pair.lot_id);
                if (res.status === 'success' && res.data) {
                    defaults = {
                        ...defaults,
                        smv: parseFloat(res.data.smv || 0),
                        target_plan: parseFloat(res.data.target_plan || 0),
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
                        media_id: res.data.media_id,
                        media_url: res.data.media_url
                    };
                }
            } catch (e) { }

            return {
                lot_id: pair.lot_id,
                label: lotInfo?.label,
                ...defaults
            };
        }));

        setFormData(prev => ({ ...prev, lot_configs: configs }));
    };

    const handleQuickMerge = async (forceAll = false) => {
        const canMergeAll = formData.lot_configs.length === 2;
        if (!forceAll && !canMergeAll && selectedMergeIds.length < 2) return;

        setIsAutoFilling(true);
        try {
            // Use forceAll or standard selection
            const toMerge = forceAll ? formData.lot_configs : formData.lot_configs.filter(c => selectedMergeIds.includes(c.lot_id));
            const remaining = formData.lot_configs.filter(c => !toMerge.find(m => m.lot_id === c.lot_id));

            const mergedConfig: LotConfig = {
                lot_id: toMerge.map(c => c.lot_id).join(','),
                label: toMerge.map(c => c.label).join(' + '),
                smv: toMerge[0].smv,
                last_step: Math.max(...toMerge.map(c => c.last_step)),
                target_plan: toMerge.reduce((sum, c) => sum + (Number(c.target_plan) || 0), 0),
                manpower: toMerge.reduce((sum, c) => sum + (Number(c.manpower) || 0), 0),
                plan_manpower: toMerge.reduce((sum, c) => sum + (Number(c.plan_manpower) || 0), 0),
                sewer: Number(formData.sewer) || 0,
                plan_sewer: 0,
                working_hour: toMerge[0].working_hour,
                section: toMerge[0].section || 'all',
                actual_output: Math.max(...toMerge.map(c => Number(c.actual_output) || 0)),
                media_id: toMerge[0].media_id,
                media_url: toMerge[0].media_url
            };

            setFormData(prev => ({ ...prev, lot_configs: [mergedConfig, ...remaining] }));
            setSelectedMergeIds([]); // Reset selection after merge
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleLotSelection = async (ids: (string | number)[]) => {
        const prevLotIds = formData.lot_configs.flatMap(c => c.lot_id.split(','));
        const addedIds = ids.filter(id => !prevLotIds.includes(String(id)));
        const existingConfigs = formData.lot_configs.filter(c =>
            c.lot_id.split(',').some(id => ids.includes(id))
        );

        const newConfigs = await Promise.all(addedIds.map(async (lotId) => {
            const lotInfo = lots.find(l => String(l.id) === String(lotId));
            let defaults = {
                smv: 0,
                last_step: 0,
                target_plan: 0,
                manpower: 0,
                plan_manpower: 0,
                sewer: 0,
                plan_sewer: 0,
                working_hour: 8,
                section: 'all',
                actual_output: 0,
                media_id: undefined as string | undefined,
                media_url: undefined as string | undefined
            };

            try {
                const res = await ProductivityService.getLastInfo(String(lotId));
                if (res.status === 'success' && res.data) {
                    defaults = {
                        ...defaults,
                        smv: parseFloat(res.data.smv || 0),
                        target_plan: parseFloat(res.data.target_plan || 0),
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
                        media_id: res.data.media_id,
                        media_url: res.data.media_url
                    };
                }
            } catch (e) { }

            return {
                lot_id: String(lotId),
                label: lotInfo?.label,
                ...defaults
            };
        }));

        setFormData(prev => ({ ...prev, lot_configs: [...existingConfigs, ...newConfigs] }));
    };

    const updateLotConfig = (index: number, field: keyof LotConfig, value: any) => {
        setFormData(prev => {
            const nextConfigs = [...prev.lot_configs];
            nextConfigs[index] = { ...nextConfigs[index], [field]: value };
            return { ...prev, lot_configs: nextConfigs };
        });
    };

    const handleSave = async () => {
        if (!formData.line_id || formData.lot_configs.length === 0) {
            alert('Selection required: Line & Styles');
            return;
        }

        setIsSaving(true);
        try {
            const processedLotData = formData.lot_configs.flatMap(config => {
                const ids = config.lot_id.split(',');
                if (ids.length > 1) {
                    return ids.map(id => ({
                        ...config,
                        lot_id: id,
                    }));
                }
                return [config];
            });

            const payload = {
                ...formData,
                manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.manpower) || 0), 0),
                plan_manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.plan_manpower) || 0), 0),
                sewer: Number(formData.sewer) || 0,
                plan_sewer: 0,
                working_hour: formData.lot_configs[0]?.working_hour || 8,
                lot_data: processedLotData
            };
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
        <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between gap-6 pb-2">
                <div className="flex items-center gap-6">
                    <div className="bg-zinc-900 p-4 rounded-[1.5rem] text-white shadow-2xl">
                        <Icon icon="solar:chart-square-bold-duotone" className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Performance Hub Log</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-none">Granular Resource Allocation per Style</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="h-12 px-6 bg-white border border-zinc-200 text-zinc-500 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                        <Icon icon="solar:undo-left-bold" className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                    {currentTargetSum > 0 && (
                        <div className="flex flex-col items-end px-6 border-l border-zinc-200 py-1">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Global Target</span>
                            <span className="text-2xl font-black text-zinc-900 tracking-tighter tabular-nums leading-none mt-1">{currentTargetSum}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Section */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 relative">
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Event Date</label>
                            <DatePicker
                                value={formData.date}
                                onChange={(val) => setFormData({ ...formData, date: val })}
                                className="w-[200px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Line</label>
                            <Select
                                options={lines}
                                value={formData.line_id}
                                onChange={(val) => setFormData({ ...formData, line_id: String(val) })}
                                placeholder="Select Line"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1">Total MG / Helper</label>
                            <input
                                type="text"
                                value={formData.sewer}
                                onChange={(e) => {
                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                    setFormData(prev => ({
                                        ...prev,
                                        sewer: val as any,
                                        lot_configs: prev.lot_configs.map(c => ({ ...c, sewer: Number(val) || 0 }))
                                    }));
                                }}
                                onBlur={() => {
                                    const val = Number(formData.sewer) || 0;
                                    setFormData(prev => ({
                                        ...prev,
                                        sewer: val,
                                        lot_configs: prev.lot_configs.map(c => ({ ...c, sewer: val }))
                                    }));
                                }}
                                className="w-[180px] bg-emerald-50 h-[50px] rounded-xl px-4 text-sm font-black text-emerald-800 border border-emerald-100 shadow-sm outline-none focus:border-emerald-500 transition-all font-mono"
                            />
                        </div>

                        {isAutoFilling && (
                            <div className="flex items-center gap-2 text-zinc-400 animate-pulse ml-auto bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                                <Icon icon="solar:refresh-bold" className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Syncing Data...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Units Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Operational Units</h3>
                        </div>

                        {formData.lot_configs.length === 2 && selectedMergeIds.length === 0 && (
                            <button
                                onClick={() => handleQuickMerge(true)}
                                className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 shadow-sm animate-in fade-in duration-500"
                            >
                                <Icon icon="solar:globus-bold-duotone" className="w-4 h-4" />
                                <span>Combine Both Styles</span>
                            </button>
                        )}

                        {selectedMergeIds.length > 1 && (
                            <button
                                onClick={() => handleQuickMerge(false)}
                                className="px-6 py-2 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl animate-in zoom-in duration-300"
                            >
                                <Icon icon="solar:globus-bold-duotone" className="w-4 h-4 text-emerald-400" />
                                <span>Combine {selectedMergeIds.length} Selected Styles</span>
                            </button>
                        )}

                        {formData.lot_configs.length > 2 && selectedMergeIds.length < 2 && (
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Select styles to combine</p>
                        )}
                    </div>
                    <div className="w-[400px]">
                        <MultiSelect
                            options={lots}
                            value={formData.lot_configs.map(c => c.lot_id.split(',')[0])}
                            onChange={handleLotSelection}
                            placeholder="Add Style / GL..."
                        />
                    </div>
                </div>

                {formData.lot_configs.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {formData.lot_configs.map((config, cIdx) => (
                            <div
                                key={`${config.lot_id}-${cIdx}`}
                                onClick={() => {
                                    if (formData.lot_configs.length > 1) {
                                        if (selectedMergeIds.includes(config.lot_id)) {
                                            setSelectedMergeIds(prev => prev.filter(id => id !== config.lot_id));
                                        } else {
                                            setSelectedMergeIds(prev => [...prev, config.lot_id]);
                                        }
                                    }
                                }}
                                className={cn(
                                    "bg-white rounded-[3rem] border p-10 shadow-sm group hover:border-zinc-900 transition-all duration-500 relative overflow-hidden cursor-default",
                                    selectedMergeIds.includes(config.lot_id) ? "border-blue-500 ring-4 ring-blue-50 scale-[0.98]" : "border-zinc-100"
                                )}
                            >
                                {/* Selection Indicator */}
                                {formData.lot_configs.length > 1 && (
                                    <div className="absolute top-10 left-10 z-20 pointer-events-none">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedMergeIds.includes(config.lot_id)
                                                ? "bg-blue-600 border-blue-600 scale-125"
                                                : "bg-white border-zinc-200"
                                        )}>
                                            {selectedMergeIds.includes(config.lot_id) && <Icon icon="solar:check-bold" className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                )}
                                {/* Selection Indicator */}
                                {formData.lot_configs.length > 1 && (
                                    <div className="absolute top-10 left-10 z-20 pointer-events-none">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                            selectedMergeIds.includes(config.lot_id)
                                                ? "bg-blue-600 border-blue-600 scale-125"
                                                : "bg-white border-zinc-200"
                                        )}>
                                            {selectedMergeIds.includes(config.lot_id) && <Icon icon="solar:check-bold" className="w-3 h-3 text-white" />}
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-0 right-0 p-6 z-10 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newConfig = { ...config };
                                            setFormData(prev => ({
                                                ...prev,
                                                lot_configs: [...prev.lot_configs, newConfig]
                                            }));
                                        }}
                                        title="Duplicate Unit (for different workstation)"
                                        className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-blue-100"
                                    >
                                        <Icon icon="solar:copy-bold" className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...formData, lot_configs: formData.lot_configs.filter((_, i) => i !== cIdx) });
                                            setSelectedMergeIds(prev => prev.filter(id => id !== config.lot_id));
                                        }}
                                        className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className={cn(
                                    "mb-10 flex gap-6 items-start transition-all",
                                    formData.lot_configs.length > 1 ? "pl-12" : ""
                                )}>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPickingMediaFor(`${config.lot_id}|${cIdx}`);
                                        }}
                                        className="w-24 h-24 rounded-2xl bg-zinc-50 border border-zinc-100 flex-shrink-0 overflow-hidden relative cursor-pointer hover:border-blue-500 transition-all"
                                    >
                                        {config.media_url ? (
                                            <img src={config.media_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                                                <Icon icon="solar:camera-bold" className="w-6 h-6 mb-1" />
                                                <span className="text-[7px] font-black uppercase text-zinc-400">Add Asset</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Operational Unit</p>
                                        </div>
                                        <h4 className="text-2xl font-black text-zinc-900 tracking-tight truncate pr-12">{config.label}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{config.section}</p>
                                            {config.actual_output !== undefined && config.actual_output > 0 && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Done:</span>
                                                    <span className="text-[11px] font-black text-blue-600">{config.actual_output.toLocaleString()} PCS</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Work Section</label>
                                        <Select
                                            options={[
                                                { id: 'all', label: 'All Sections' },
                                                { id: 'offline', label: 'Offline' },
                                                { id: 'inline', label: 'Inline' },
                                                { id: 'outline', label: 'Outline' }
                                            ]}
                                            value={config.section || 'all'}
                                            onChange={(val) => updateLotConfig(cIdx, 'section', String(val))}
                                            placeholder="Select Section"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Plan MP</label>
                                        <input
                                            type="number"
                                            value={config.plan_manpower}
                                            onChange={(e) => updateLotConfig(cIdx, 'plan_manpower', Number(e.target.value))}
                                            className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-500 outline-none border border-zinc-100 focus:border-zinc-900 transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Target Plan (PCS)</label>
                                        <input
                                            type="number"
                                            value={config.target_plan}
                                            onChange={(e) => updateLotConfig(cIdx, 'target_plan', Number(e.target.value))}
                                            className="w-full bg-blue-100 h-14 rounded-2xl px-6 text-xl font-black text-emerald-400 outline-none border border-blue-200 focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1">Actual MP</label>
                                        <input
                                            type="number"
                                            value={config.manpower}
                                            onChange={(e) => updateLotConfig(cIdx, 'manpower', Number(e.target.value))}
                                            className="w-full bg-blue-50/30 h-14 rounded-2xl px-5 text-lg font-black text-blue-700 outline-none border border-blue-100 focus:border-blue-400 transition-all"
                                        />
                                    </div>
                                    <div className="md:w-[100px] space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">SMV</label>
                                        <input
                                            type="text"
                                            value={config.smv}
                                            onChange={(e) => updateLotConfig(cIdx, 'smv', e.target.value.replace(',', '.'))}
                                            onBlur={() => updateLotConfig(cIdx, 'smv', Number(config.smv) || 0)}
                                            className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold outline-none border border-zinc-100 focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                    <div className="md:w-[100px] space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Step</label>
                                        <input
                                            type="number"
                                            value={config.last_step}
                                            onChange={(e) => updateLotConfig(cIdx, 'last_step', Number(e.target.value))}
                                            className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold outline-none border border-zinc-100 focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">WH (Hours)</label>
                                        <input
                                            type="number"
                                            value={config.working_hour}
                                            onChange={(e) => updateLotConfig(cIdx, 'working_hour', Number(e.target.value))}
                                            className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-800 outline-none border border-zinc-100 focus:border-zinc-900 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-300">
                        <Icon icon="solar:plate-bold-duotone" className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Add Styles to Begin Configuration</p>
                    </div>
                )}
            </div>

            <div className="pt-8 flex justify-end">
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isSaving || !formData.line_id || formData.lot_configs.length === 0}
                    className="h-16 px-12 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                    <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                    <span>{formData.id ? 'Save Changes' : 'Finalize Performance Log'}</span>
                </button>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-md bg-white rounded-[2.5rem] p-10">
                    <DialogHeader>
                        <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl">
                            <Icon icon="solar:shield-check-bold-duotone" className="w-8 h-8 text-emerald-400" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight">CONFIRM LOG ENTRY</DialogTitle>
                        <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">
                            Please verify the resources before synchronizing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6 text-sm">
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-zinc-400 font-black uppercase text-[10px]">Active Line</span>
                            <span className="font-black text-zinc-900">{lines.find(l => String(l.id) === String(formData.line_id))?.label || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-zinc-400 font-black uppercase text-[10px]">MG Headcount</span>
                            <span className="font-black text-emerald-600">{formData.sewer}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-3">
                        <button onClick={() => setShowConfirm(false)} className="flex-1 h-14 rounded-2xl border border-zinc-200 text-zinc-400 text-[10px] font-black uppercase">Cancel</button>
                        <button onClick={() => { setShowConfirm(false); handleSave(); }} className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl">Confirm & Sync</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <MediaPicker
                open={pickingMediaFor !== null}
                onOpenChange={(open) => !open && setPickingMediaFor(null)}
                onSelect={(media) => {
                    if (pickingMediaFor) {
                        const [_, cIdx] = pickingMediaFor.split('|');
                        updateLotConfig(Number(cIdx), 'media_id', media.id);
                        updateLotConfig(Number(cIdx), 'media_url', media.url);
                        setPickingMediaFor(null);
                    }
                }}
            />
        </div>
    );
};
