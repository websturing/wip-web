'use client';

import { DatePicker } from '@/app/components/ui/DatePicker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { Select } from '@/app/components/ui/Select';
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
        date: new Date().toISOString().split('T')[0],
        sewer: 1,
        lot_configs: [] as LotConfig[]
    });

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
                    const configs = item.lots ? item.lots.map((l: any) => ({
                        lot_id: l.id,
                        label: `${l.gl_group?.gl_number || ''} / ${(l.lot_code || '').replace(/^0+/, '')}`,
                        smv: parseFloat(l.pivot?.smv || 0),
                        last_step: parseFloat(l.pivot?.last_step || 0),
                        target_plan: parseFloat(l.pivot?.target_plan || 0),
                        manpower: parseFloat(l.pivot?.manpower || 0),
                        plan_manpower: parseFloat(l.pivot?.plan_manpower || 0),
                        sewer: parseFloat(l.pivot?.sewer || 0),
                        plan_sewer: parseFloat(l.pivot?.plan_sewer || 0),
                        working_hour: parseFloat(l.pivot?.working_hour || 8),
                    })) : [];

                    setFormData({
                        id: item.id,
                        line_id: item.line_id,
                        date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
                        sewer: parseFloat(item.sewer || 0),
                        lot_configs: configs
                    });
                }
            }).finally(() => setIsLoading(false));
        }
    }, [id]);

    // Auto-fill GLs from Production Output if line is selected
    useEffect(() => {
        if (!formData.line_id || !formData.date || !!formData.id || lots.length === 0) return;

        const autoFillStyles = async () => {
            try {
                const res = await ProductionService.getAll(formData.date);
                if (res.status === 'success') {
                    const lineOutput = res.data.filter((p: any) => String(p.line_id) === String(formData.line_id));
                    const lotIds = Array.from(new Set(lineOutput.flatMap((p: any) => p.items?.map((i: any) => i.lot_id)).filter(Boolean))) as string[];

                    if (lotIds.length > 0) {
                        const currentIds = formData.lot_configs.map(c => c.lot_id);
                        const hasNew = lotIds.some(id => !currentIds.includes(id));
                        if (hasNew) {
                            handleLotSelection(Array.from(new Set([...currentIds, ...lotIds])));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to auto-select styles:', error);
            }
        };

        autoFillStyles();
    }, [formData.line_id, formData.date, lots]);

    const handleLotSelection = async (ids: (string | number)[]) => {
        const prevLotIds = formData.lot_configs.map(c => c.lot_id);
        const newConfigs = [...formData.lot_configs];
        const finalConfigs = newConfigs.filter(c => ids.includes(c.lot_id));
        const addedIds = ids.filter(id => !prevLotIds.includes(String(id)));

        for (const lotId of addedIds) {
            const lotInfo = lots.find(l => l.id === lotId);
            let defaults = {
                smv: 0,
                last_step: 0,
                target_plan: 0,
                manpower: 0,
                plan_manpower: 0,
                sewer: 0,
                plan_sewer: 0,
                working_hour: 8
            };

            try {
                const res = await ProductivityService.getLastInfo(String(lotId));
                if (res.status === 'success' && res.data) {
                    defaults = {
                        smv: parseFloat(res.data.smv || 0),
                        last_step: 0,
                        target_plan: parseFloat(res.data.target_plan || 0), // Use previous if exists
                        manpower: 0,
                        plan_manpower: parseFloat(res.data.plan_manpower || 0),
                        sewer: parseFloat(res.data.sewer || 0),
                        plan_sewer: 0,
                        working_hour: 8
                    };
                }
            } catch (e) { }

            finalConfigs.push({
                lot_id: String(lotId),
                label: lotInfo?.label,
                ...defaults
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

    const handleSave = async () => {
        if (!formData.line_id || formData.lot_configs.length === 0) {
            alert('Selection required: Line & Styles');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.manpower) || 0), 0),
                plan_manpower: formData.lot_configs.reduce((sum, c) => sum + (Number(c.plan_manpower) || 0), 0),
                plan_sewer: 0,
                working_hour: formData.lot_configs[0]?.working_hour || 8,
                lot_data: formData.lot_configs
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
        <div className="max-w-[1800px] mx-auto space-y-6 animate-in fade-in duration-700 ">
            {/* Standard Page Header */}
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

            <div className="grid grid-cols-1 gap-8">
                {/* Identification & Selection */}
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
                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-1 cursor-help" title="Matching Girl">Matching Girl / Helper</label>
                            <input
                                type="number"
                                value={formData.sewer}
                                onChange={(e) => setFormData({ ...formData, sewer: Number(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                                className="w-[180px] bg-emerald-50 h-[50px] rounded-xl px-4 text-sm font-black text-emerald-700 outline-none border border-emerald-100 focus:border-emerald-400 focus:bg-white transition-all shadow-sm"
                            />
                        </div>

                    </div>
                </div>

                {/* Granular Style Cards */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Operational Units</h3>
                        </div>
                        <div className="w-[400px]">
                            <MultiSelect
                                options={lots}
                                value={formData.lot_configs.map(c => c.lot_id)}
                                onChange={handleLotSelection}
                                placeholder="Add Style / GL..."
                            />
                        </div>
                    </div>
                    {formData.lot_configs.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {formData.lot_configs.map((config) => (
                                <div key={config.lot_id} className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm group hover:border-zinc-900 transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6">
                                        <button onClick={() => setFormData({ ...formData, lot_configs: formData.lot_configs.filter(c => c.lot_id !== config.lot_id) })} className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                            <Icon icon="solar:trash-bin-trash-bold" className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Operational Unit</p>
                                        </div>
                                        <h4 className="text-2xl font-black text-zinc-900 tracking-tight leading-none truncate pr-12">{config.label}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Plan Resources */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 cursor-help" title="Manpower">Plan MP</label>
                                            <input
                                                type="number"
                                                value={config.plan_manpower}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'plan_manpower', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-500 outline-none border border-zinc-100 focus:border-zinc-900 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Actual Resources */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest ml-1 cursor-help" title="Manpower">Actual MP</label>
                                            <input
                                                type="number"
                                                value={config.manpower}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'manpower', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-blue-50/30 h-14 rounded-2xl px-5 text-lg font-black text-blue-700 outline-none border border-blue-100 focus:border-blue-400 focus:bg-white transition-all"
                                            />
                                        </div>



                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">WH (Hours)</label>
                                            <input
                                                type="number"
                                                value={config.working_hour}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'working_hour', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold text-zinc-800 outline-none border border-zinc-100 focus:border-zinc-900 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Intelligence Metrics */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">SMV</label>
                                            <input
                                                type="text"
                                                value={config.smv}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                                    updateLotConfig(config.lot_id, 'smv', val as any);
                                                }}
                                                onBlur={() => updateLotConfig(config.lot_id, 'smv', Number(config.smv) || 0)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold tabular-nums outline-none border border-zinc-100 focus:border-zinc-900 focus:bg-white transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Last Step</label>
                                            <input
                                                type="number"
                                                value={config.last_step}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'last_step', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-zinc-50 h-14 rounded-2xl px-5 text-lg font-bold tabular-nums outline-none border border-zinc-100 focus:border-zinc-900 focus:bg-white transition-all"
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-1">Target Plan (PCS)</label>
                                            <input
                                                type="number"
                                                value={config.target_plan}
                                                onChange={(e) => updateLotConfig(config.lot_id, 'target_plan', Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full bg-zinc-900 h-14 rounded-2xl px-6 text-xl font-black text-emerald-400 tabular-nums outline-none border border-zinc-800 focus:border-emerald-500 transition-all shadow-xl"
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
                        className="h-16 px-12 bg-zinc-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-zinc-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                    >
                        <Icon icon="solar:diskette-bold" className="w-5 h-5" />
                        <span>{formData.id ? 'Save Changes' : 'Finalize & Sync Performance'}</span>
                    </button>
                </div>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <DialogContent className="max-w-md bg-white border-zinc-100 shadow-2xl rounded-[2.5rem] p-10">
                        <DialogHeader>
                            <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl">
                                <Icon icon="solar:shield-check-bold-duotone" className="w-8 h-8 text-emerald-400" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight not-italic">CONFIRM LOG ENTRY</DialogTitle>
                            <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2 leading-relaxed">
                                Please verify the resources and operational units before synchronizing with the central intelligence.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Line</span>
                                <span className="text-sm font-black text-zinc-900">{lines.find(l => String(l.id) === String(formData.line_id))?.label || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">MG Headcount</span>
                                <span className="text-sm font-black text-emerald-600">{formData.sewer} PAX</span>
                            </div>
                            <div className="space-y-3">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Configured Styles ({formData.lot_configs.length})</span>
                                <div className="flex flex-wrap gap-2">
                                    {formData.lot_configs.map((c, i) => (
                                        <div key={i} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-full text-[9px] font-black text-zinc-600 uppercase">
                                            {c.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 h-14 rounded-2xl border border-zinc-200 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                            >
                                Re-Check Data
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    handleSave();
                                }}
                                disabled={isSaving}
                                className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {isSaving ? 'Processing...' : 'Confirm & Sync Now'}
                                <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
