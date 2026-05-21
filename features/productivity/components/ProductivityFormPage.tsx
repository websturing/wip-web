'use client';

import { MediaPicker } from '@/app/components/MediaPicker';
import { DatePicker } from '@/app/components/ui/DatePicker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useProductivityForm } from '../hooks/useProductivityForm';

export const ProductivityFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const {
        isLoading,
        isSaving,
        lines,
        lots,
        showConfirm,
        setShowConfirm,
        formData,
        setFormData,
        pickingMediaFor,
        setPickingMediaFor,
        isAutoFilling,
        selectedMergeIds,
        setSelectedMergeIds,
        currentTargetSum,
        handleQuickMerge,
        handleUnmerge,
        handleLotSelection,
        updateLotConfig,
        duplicateLotConfig,
        removeLotConfig,
        handleSave
    } = useProductivityForm(id ? String(id) : undefined);

    const onSaveSuccess = (date: string) => {
        router.push(`/admin/productivity?date=${date}`);
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
                <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-zinc-100 shadow-sm p-6 lg:p-8 relative">
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
                                className="w-[180px] bg-emerald-50 h-12 rounded-xl px-4 text-sm font-black text-emerald-800 border border-emerald-100 shadow-sm outline-none focus:border-emerald-500 transition-all font-mono"
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
                    <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                        <th className="py-3 px-1.5 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-10">Merge</th>
                                        <th className="py-3 px-2 text-[9px] font-black text-zinc-400 uppercase tracking-wider min-w-[200px]">Style & GL Details</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-14">Plan MP</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-20">Target (PCS)</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-14">Actual MP</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-12">SMV</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-14">Step</th>
                                        <th className="py-3 px-1 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-center w-12">WH</th>
                                        <th className="py-3 px-2 text-[9px] font-black text-zinc-400 uppercase tracking-wider text-right w-28">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {formData.lot_configs.map((config, cIdx) => {
                                        const isMerged = config.lot_id.includes(',');
                                        const isSelected = selectedMergeIds.includes(config.row_id);
                                        return (
                                            <tr
                                                key={config.row_id}
                                                className={cn(
                                                    "group transition-colors hover:bg-zinc-50/50",
                                                    isSelected ? "bg-blue-50/20" : ""
                                                )}
                                            >
                                                {/* Merge Box */}
                                                <td className="py-2 px-1.5 text-center align-middle">
                                                    <div className="flex justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (formData.lot_configs.length > 1) {
                                                                    if (isSelected) {
                                                                        setSelectedMergeIds(prev => prev.filter(id => id !== config.row_id));
                                                                    } else {
                                                                        setSelectedMergeIds(prev => [...prev, config.row_id]);
                                                                    }
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                                isSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-zinc-200 hover:border-zinc-400"
                                                            )}
                                                        >
                                                            {isSelected && <Icon icon="solar:check-bold" className="w-2.5 h-2.5 text-white" />}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Style / GL Details */}
                                                <td className="py-2 px-2 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        {/* Thumbnail */}
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPickingMediaFor(`${config.lot_id}|${cIdx}`);
                                                            }}
                                                            className="w-9 h-9 rounded-md bg-zinc-50 border border-zinc-100 flex-shrink-0 overflow-hidden relative cursor-pointer hover:border-blue-500 transition-all flex items-center justify-center group/thumb shadow-sm"
                                                        >
                                                            {config.media_url ? (
                                                                <img src={config.media_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 group-hover/thumb:text-blue-500">
                                                                    <Icon icon="solar:camera-bold" className="w-3 h-3" />
                                                                    <span className="text-[5px] font-black uppercase text-zinc-400">Asset</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Labels & Colors */}
                                                        <div className="min-w-0 flex-1 space-y-0.5">
                                                            <div className="flex items-center gap-1 flex-wrap">
                                                                {isMerged ? (
                                                                    <span className="px-1 py-0.2 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[7px] font-black uppercase tracking-wider flex-shrink-0">Merged</span>
                                                                ) : (
                                                                    <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span>
                                                                )}
                                                                <h4 className="text-xs font-black text-zinc-900 tracking-tight truncate max-w-[160px]" title={config.label}>
                                                                    {config.label}
                                                                </h4>
                                                                {/* Read-only section badge */}
                                                                {(() => {
                                                                    const s = (config.section || 'all').toLowerCase();
                                                                    const cls = s === 'inline'
                                                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                                        : s === 'offline'
                                                                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                                        : s === 'outline'
                                                                        ? 'bg-purple-50 text-purple-600 border-purple-200'
                                                                        : 'bg-zinc-100 text-zinc-400 border-zinc-200';
                                                                    return (
                                                                        <span className={`px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-wider flex-shrink-0 ${cls}`}>
                                                                            {s === 'all' ? 'All' : s}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                {config.actual_output !== undefined && config.actual_output > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="px-1 py-0.2 bg-emerald-50 border border-emerald-100 rounded text-[8px] font-black text-emerald-700">
                                                                            <span className="opacity-75 uppercase text-[7px] tracking-tight mr-1">Done:</span>
                                                                            <span>{config.actual_output.toLocaleString()}</span>
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {config.outputs_by_color && config.outputs_by_color.length > 0 && (
                                                                    <div className="flex flex-wrap gap-0.5 items-center">
                                                                        {config.outputs_by_color.map((colorItem, colorIdx) => (
                                                                            <div
                                                                                key={colorIdx}
                                                                                className="flex items-center gap-0.5 px-1 py-0.2 bg-zinc-50 border border-zinc-200/50 rounded text-[8px] font-semibold text-zinc-600 shadow-sm"
                                                                            >
                                                                                <span className="uppercase text-[7px] tracking-tight text-zinc-400 font-bold">{colorItem.color}:</span>
                                                                                <span className="font-black text-zinc-950">{colorItem.qty.toLocaleString()}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Plan MP */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="number"
                                                        value={config.plan_manpower}
                                                        onChange={(e) => updateLotConfig(cIdx, 'plan_manpower', Number(e.target.value))}
                                                        className="w-11 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white h-8 rounded-lg px-1 text-center text-xs font-bold text-zinc-600 outline-none border border-zinc-100 focus:border-zinc-900 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* Target Plan (PCS) */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="number"
                                                        value={config.target_plan}
                                                        onChange={(e) => updateLotConfig(cIdx, 'target_plan', Number(e.target.value))}
                                                        className="w-18 bg-emerald-50/50 hover:bg-emerald-50 focus:bg-white h-8 rounded-lg px-1 text-center text-xs font-black text-emerald-800 outline-none border border-emerald-100 focus:border-emerald-500 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* Actual MP */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="number"
                                                        value={config.manpower}
                                                        onChange={(e) => updateLotConfig(cIdx, 'manpower', Number(e.target.value))}
                                                        className="w-11 bg-blue-50/30 hover:bg-blue-50/60 focus:bg-white h-8 rounded-lg px-1 text-center text-xs font-black text-blue-700 outline-none border border-blue-100 focus:border-blue-400 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* SMV */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="text"
                                                        value={config.smv}
                                                        onChange={(e) => updateLotConfig(cIdx, 'smv', e.target.value.replace(',', '.'))}
                                                        onBlur={() => updateLotConfig(cIdx, 'smv', Number(config.smv) || 0)}
                                                        className="w-10 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white h-8 rounded-lg px-0.5 text-center text-xs font-bold text-zinc-700 outline-none border border-zinc-100 focus:border-zinc-900 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* Last Step */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="number"
                                                        value={config.last_step}
                                                        onChange={(e) => updateLotConfig(cIdx, 'last_step', Number(e.target.value))}
                                                        className="w-11 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white h-8 rounded-lg px-1 text-center text-xs font-bold text-zinc-700 outline-none border border-zinc-100 focus:border-zinc-900 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* WH (Hours) */}
                                                <td className="py-2 px-1 align-middle text-center">
                                                    <input
                                                        type="number"
                                                        value={config.working_hour}
                                                        onChange={(e) => updateLotConfig(cIdx, 'working_hour', Number(e.target.value))}
                                                        className="w-10 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white h-8 rounded-lg px-0.5 text-center text-xs font-bold text-zinc-800 outline-none border border-zinc-100 focus:border-zinc-900 transition-all font-mono"
                                                    />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-2 px-2 align-middle text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {isMerged && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUnmerge(cIdx);
                                                                }}
                                                                title="Split Combined Style"
                                                                className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-amber-100 active:scale-95"
                                                            >
                                                                <Icon icon="solar:link-broken-bold" className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                duplicateLotConfig(cIdx);
                                                            }}
                                                            title="Duplicate Entry"
                                                            className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm border border-blue-100 active:scale-95"
                                                        >
                                                            <Icon icon="solar:copy-bold" className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeLotConfig(cIdx);
                                                            }}
                                                            title="Remove Entry"
                                                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
                                                        >
                                                            <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
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
                        <button onClick={() => { setShowConfirm(false); handleSave(onSaveSuccess); }} className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl">Confirm & Sync</button>
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
