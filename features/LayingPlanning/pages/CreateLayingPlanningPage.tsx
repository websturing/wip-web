'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { useReference } from '@/features/Reference/hooks/useReference';
import { useReferenceColors } from '@/features/Reference/hooks/useReferenceColors';
import { useReferenceFabric } from '@/features/Reference/hooks/useReferenceFabric';
import { useReferenceSizes } from '@/features/Reference/hooks/useReferenceSizes';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { cn } from '@/lib/utils';
import { useLayingPlanningForm, LayingPlanningFormData } from '../hooks/useLayingPlanningForm';
import { LayingPlanningService } from '../services/LayingPlanningService';

export default function CreateLayingPlanningPage() {
    const breadcrumbItems = useBreadcrumb({
        'create': { label: 'Create New Laying Planning', icon: 'solar:chart-2-bold-duotone' }
    });

    const { lots, isLoading: isLoadingLots } = useReference();
    const { colors, isLoading: isLoadingColors } = useReferenceColors();
    const { fabrics, isLoading: isLoadingFabrics } = useReferenceFabric();
    const { sizes: masterSizes, isLoading: isLoadingSizes } = useReferenceSizes();

    const {
        formData,
        updateField,
        errors,
        totalSizeQty,
        handleAddEmptySizeRow,
        handleUpdateSize,
        handleRemoveSize,
        handleTogglePart,
        triggerValidation,
        handleFinalSubmit
    } = useLayingPlanningForm();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleInitialSave = () => {
        if (triggerValidation()) {
            setIsConfirmModalOpen(true);
        }
    };

    const lotOptions = useMemo(() => lots.map((l: any) => {
        const lotQty = l.gmt_qty || l.gl_group?.gmt_qty || 0;
        const plannedQty = Number(l.laying_planning_sizes_sum_order_qty) || 0;
        const remainingQty = lotQty - plannedQty;
        const isFullyPlanned = lotQty > 0 && remainingQty <= 0;

        return {
            id: l.id.toString(),
            label: `${l.lot_code || l.lot_number || 'Unknown Lot'} (Order: ${lotQty} | Remaining: ${Math.max(0, remainingQty)})`,
            colorClass: isFullyPlanned ? "text-red-500 hover:bg-red-50" : undefined
        };
    }), [lots]);

    const colorOptions = colors.map((c: any) => ({
        id: c.id.toString(),
        label: c.standard_name || c.code || 'Unknown Color'
    }));

    const fabricOptions = fabrics.map((f: any) => ({
        id: f.id.toString(),
        label: f.standard_content || 'Unknown Fabric'
    }));

    const sizeOptions = (masterSizes || []).map((s: any) => ({
        id: s.id.toString(),
        label: s.size || s.size_code || s.name || 'Unknown Size'
    }));

    const typeOptions = [
        { id: '019ef740-1826-72ce-8cd6-2003ea77f496', label: 'BODY' },
        { id: '019ef740-184d-714c-aa4c-c0d6f023a816', label: 'COMBINASI' }
    ];

    const patternOptions = ['Solid', 'Stripe'];

    // Reusable Error Component
    const ErrorMsg = ({ msg }: { msg?: string }) => {
        if (!msg) return null;
        return <span className="text-red-500 text-[10px] font-bold mt-1 block">{msg}</span>;
    };

    type RadioOption = string | { id: string, label: string };
    const RadioCard = ({ title, options, stateKey }: { title: string, options: RadioOption[], stateKey: keyof LayingPlanningFormData }) => (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{title}</label>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
                {options.map((opt) => {
                    const value = typeof opt === 'string' ? opt : opt.id;
                    const label = typeof opt === 'string' ? opt : opt.label;
                    const isSelected = formData[stateKey] === value;
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateField(stateKey, value as any)}
                            className={cn(
                                "h-14 rounded-xl border flex items-center justify-between px-4 transition-all text-left group",
                                isSelected 
                                    ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20" 
                                    : "bg-zinc-50 border-zinc-100 hover:border-zinc-200",
                                errors[stateKey] && "border-red-300 bg-red-50"
                            )}
                        >
                            <span className={cn("text-[12px] font-bold", isSelected ? "text-blue-700" : "text-zinc-600 group-hover:text-zinc-900")}>{label}</span>
                            <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-300",
                                errors[stateKey] && !isSelected && "border-red-300"
                            )}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                        </button>
                    );
                })}
            </div>
            <ErrorMsg msg={errors[stateKey]} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="animate-in fade-in duration-700">
                <PageHeader items={breadcrumbItems} />
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden mb-12">
                <div className="py-5 px-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Create Laying Planning</h2>
                        <p className="text-xs font-bold text-zinc-400 tracking-widest mt-1">Configure your marker and fabric requirements</p>
                    </div>
                </div>

                <div className="p-8">
                    <form className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        
                        {/* SECTION A: REFERENCE INFO */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">A. Reference Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Lot / Garment Reference</label>
                                    <Select
                                        isMulti={true}
                                        placeholder={isLoadingLots ? "Loading Lots..." : "Select Lots..."}
                                        options={lotOptions}
                                        value={formData.lot_ids}
                                        onChange={(val) => {
                                            const selectedLotIds = val as string[];
                                            updateField('lot_ids', selectedLotIds);
                                            
                                            const selectedLots = lots.filter((l: any) => selectedLotIds.includes(l.id.toString()));
                                            if (selectedLots.length > 0) {
                                                const totalQty = selectedLots.reduce((acc, l) => {
                                                    const lotQty = l.gmt_qty || l.gl_group?.gmt_qty || 0;
                                                    const plannedQty = Number(l.laying_planning_sizes_sum_order_qty) || 0;
                                                    return acc + Math.max(0, lotQty - plannedQty);
                                                }, 0);
                                                const buyer = selectedLots[0].gl_group?.customer?.name || '';
                                                updateField('order_qty', totalQty.toString());
                                                updateField('buyer', buyer);
                                            } else {
                                                updateField('order_qty', '');
                                                updateField('buyer', '');
                                            }
                                        }}
                                        disabled={isLoadingLots}
                                    />
                                    <ErrorMsg msg={errors.lot_ids} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Plan Date</label>
                                    <input type="date" className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={formData.plan_date} onChange={(e) => updateField('plan_date', e.target.value)} />
                                    <ErrorMsg msg={errors.plan_date} />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Buyer</label>
                                    <input className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold text-zinc-500 cursor-not-allowed" readOnly value={formData.buyer} placeholder="Auto-filled from Lot" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Order Quantity</label>
                                    <input className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold text-zinc-500 cursor-not-allowed" readOnly value={formData.order_qty} placeholder="Auto-filled from Lot" />
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color Setup</label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">System Master Color</label>
                                            <Select
                                                placeholder={isLoadingColors ? "Loading Colors..." : "Select Color..."}
                                                options={colorOptions}
                                                value={formData.color_id}
                                                onChange={(val) => updateField('color_id', val as string)}
                                                disabled={isLoadingColors}
                                            />
                                            <ErrorMsg msg={errors.color_id} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Marker Alias (Optional)</label>
                                            <div className="flex flex-col gap-2">
                                                <input 
                                                    className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                                                    placeholder="e.g. Warehouse Navy"
                                                    value={formData.color_alias}
                                                    onChange={(e) => updateField('color_alias', e.target.value)}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const matchedColor = colorOptions.find(c => c.id === formData.color_id);
                                                        if (matchedColor) {
                                                            updateField('color_alias', matchedColor.label);
                                                        }
                                                    }}
                                                    className="w-max text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 ml-1"
                                                >
                                                    <Icon icon="solar:copy-bold" className="w-3.5 h-3.5" />
                                                    Same as Master Color
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fabric Setup</label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">System Master Fabric</label>
                                            <Select
                                                placeholder={isLoadingFabrics ? "Loading Fabrics..." : "Select Fabric..."}
                                                options={fabricOptions}
                                                value={formData.fabric_id}
                                                onChange={(val) => updateField('fabric_id', val as string)}
                                                disabled={isLoadingFabrics}
                                            />
                                            <ErrorMsg msg={errors.fabric_id} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Marker Alias (Optional)</label>
                                            <div className="flex flex-col gap-2">
                                                <input 
                                                    className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm"
                                                    placeholder="e.g. Local Cotton"
                                                    value={formData.fabric_alias}
                                                    onChange={(e) => updateField('fabric_alias', e.target.value)}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const matchedFabric = fabricOptions.find(f => f.id === formData.fabric_id);
                                                        if (matchedFabric) {
                                                            updateField('fabric_alias', matchedFabric.label);
                                                        }
                                                    }}
                                                    className="w-max text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 ml-1"
                                                >
                                                    <Icon icon="solar:copy-bold" className="w-3.5 h-3.5" />
                                                    Same as Master Fabric
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION B: CLASSIFICATIONS */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">B. Classifications</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <RadioCard title="Laying Planning Type" options={typeOptions} stateKey="laying_planning_type_id" />
                                <RadioCard title="Fabric Pattern" options={patternOptions} stateKey="fabric_pattern" />
                            </div>

                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mb-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-zinc-900">Combine / Support Marker</label>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={formData.is_combine} onChange={(e) => updateField('is_combine', e.target.checked)} />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                
                                {formData.is_combine && formData.lot_ids.length <= 1 && (
                                    <div className="space-y-1.5 pt-4 border-t border-zinc-200/50">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Parent Laying Planning ID (UUID)</label>
                                        <input className={cn("w-full h-12 bg-white border rounded-xl px-4 text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-sm", errors.laying_planning_parent_id ? "border-red-300 ring-4 ring-red-500/10" : "border-zinc-200")} placeholder="e.g. 123e4567-e89b-12d3..." value={formData.laying_planning_parent_id} onChange={(e) => updateField('laying_planning_parent_id', e.target.value)} />
                                        <ErrorMsg msg={errors.laying_planning_parent_id} />
                                    </div>
                                )}
                            </div>

                            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mb-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-zinc-900">Item Parts Selection</label>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-200/50 px-2.5 py-1 rounded-lg">
                                        {formData.is_set_item ? 'Set Item (Multiple)' : 'Single Item'}
                                    </span>
                                </div>
                                
                                <div className="pt-2 border-t border-zinc-200/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-3 block">Select Parts Included</label>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        {LayingPlanningService.AVAILABLE_PARTS.map(partName => {
                                            const isSelected = formData.parts.some(p => p.item_part === partName);
                                            return (
                                                <label key={partName} className={cn(
                                                    "relative flex items-center justify-center px-5 py-3 rounded-xl border cursor-pointer transition-all",
                                                    isSelected ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20 text-blue-700" : "bg-white border-zinc-200 text-zinc-600 hover:border-blue-300"
                                                )}>
                                                    <input 
                                                        type="checkbox" 
                                                        className="sr-only" 
                                                        checked={isSelected}
                                                        onChange={() => handleTogglePart(partName)}
                                                    />
                                                    <span className="text-xs font-bold uppercase tracking-wider">{partName}</span>
                                                    {isSelected && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                            <Icon icon="solar:check-read-bold" className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <ErrorMsg msg={errors.parts as string} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION C: LIST SIZE */}
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">C. List Size Breakdown</h3>
                            
                            {formData.lot_ids.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400 text-xs font-black uppercase tracking-widest bg-zinc-50 border border-zinc-100 rounded-2xl">
                                    Please select at least one Lot to allocate sizes
                                </div>
                            ) : (
                                formData.lot_ids.map(lotId => {
                                    const lotSizes = formData.sizes[lotId] || [];
                                    const lotObj = lots.find((l: any) => l.id.toString() === lotId);
                                    const lotLabel = lotObj ? `${lotObj.lot_code || lotObj.lot_number}` : 'Unknown Lot';
                                    
                                    const lotQty = lotObj ? (lotObj.gmt_qty || lotObj.gl_group?.gmt_qty || 0) : 0;
                                    const plannedQty = lotObj ? (Number(lotObj.laying_planning_sizes_sum_order_qty) || 0) : 0;
                                    const remainingQty = Math.max(0, lotQty - plannedQty);
                                    
                                    const lotAllocated = totalSizeQty[lotId] || 0;
                                    const isMatch = lotAllocated === remainingQty && remainingQty > 0;

                                    return (
                                        <div key={lotId} className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-4">
                                            <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-zinc-900">{lotLabel}</span>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Size Allocation</span>
                                                </div>
                                                
                                                <div className={cn(
                                                    "px-3 py-1 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-colors",
                                                    isMatch ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    <span>Order: {remainingQty}</span>
                                                    <span>/</span>
                                                    <span>Allocated: {lotAllocated}</span>
                                                    <Icon icon={isMatch ? "solar:check-circle-bold" : "solar:info-circle-bold"} className="w-3.5 h-3.5" />
                                                </div>
                                            </div>

                                            <div className={cn("border rounded-xl overflow-hidden", errors.sizes ? "border-red-300" : "border-zinc-100")}>
                                                <table className="w-full text-left">
                                                    <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        <tr>
                                                            <th className="px-6 py-4">Size Name</th>
                                                            <th className="px-6 py-4">Quantity</th>
                                                            <th className="px-6 py-4 w-24 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-zinc-50">
                                                        {lotSizes.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={3} className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">No sizes added yet</td>
                                                            </tr>
                                                        ) : (
                                                            lotSizes.map((sz) => (
                                                                <tr key={sz.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                                    <td className="px-6 py-2">
                                                                        <Select
                                                                            options={sizeOptions}
                                                                            value={sz.size_id}
                                                                            onChange={(val) => handleUpdateSize(lotId, sz.id, 'size_id', val as string)}
                                                                            placeholder={isLoadingSizes ? "Loading Sizes..." : "E.g. S, M, L..."}
                                                                            disabled={isLoadingSizes}
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-2">
                                                                        <input 
                                                                            type="number"
                                                                            className="w-24 h-10 bg-transparent border-b border-transparent group-hover:border-zinc-200 focus:border-blue-500 text-[13px] font-bold text-zinc-900 px-2 outline-none transition-all placeholder:text-zinc-300"
                                                                            placeholder="0"
                                                                            value={sz.order_qty === 0 ? '' : sz.order_qty}
                                                                            onChange={(e) => handleUpdateSize(lotId, sz.id, 'order_qty', parseInt(e.target.value) || 0)}
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-2 text-center">
                                                                        {lotSizes.length > 1 && (
                                                                            <button type="button" onClick={() => handleRemoveSize(lotId, sz.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-50 group-hover:opacity-100">
                                                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                    <tfoot className="bg-zinc-900 text-white">
                                                        <tr>
                                                            <td className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-right text-white/50">Total Allocated</td>
                                                            <td className="px-6 py-3 text-[14px] font-bold text-white">{lotAllocated}</td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button type="button" onClick={() => handleAddEmptySizeRow(lotId)} className="h-10 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                                    <Icon icon="solar:add-circle-bold" className="w-4 h-4 mr-2 inline text-zinc-400" /> Add Size Row
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <ErrorMsg msg={errors.sizes as string} />
                        </div>

                        {/* FOOTER */}
                        <div className="pt-8 flex justify-end gap-4 border-t border-zinc-100 sticky bottom-0 bg-white p-4 -mx-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-b-[2rem] z-10">
                            <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500">Cancel</Button>
                            <Button 
                                type="button" 
                                onClick={handleInitialSave}
                                className={cn(
                                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all",
                                    "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                                )}
                            >
                                Save Planning
                            </Button>
                        </div>

                    </form>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {isConfirmModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Icon icon="solar:info-circle-bold" className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 mb-2">Final Confirmation</h3>
                            <p className="text-sm font-medium text-zinc-500 mb-8">You are about to save this Laying Planning. Please confirm the details are correct.</p>
                            
                            <div className="flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => setIsConfirmModalOpen(false)} className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-widest text-zinc-500 bg-zinc-50 hover:bg-zinc-100">Cancel</Button>
                                <Button type="button" onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    handleFinalSubmit();
                                }} className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                    Confirm & Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}