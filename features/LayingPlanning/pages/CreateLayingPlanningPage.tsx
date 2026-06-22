'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { MultiSelect } from '@/app/components/ui/MultiSelect';
import { useReferenceGlnumbers } from '@/features/Reference/hooks/useReferenceGlnumbers';
import { useReferenceColors } from '@/features/Reference/hooks/useReferenceColors';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { cn } from '@/lib/utils';
import { useLayingPlanningForm, LayingPlanningFormData } from '../hooks/useLayingPlanningForm';

export default function CreateLayingPlanningPage() {
    const breadcrumbItems = useBreadcrumb({
        'create': { label: 'Create New Laying Planning', icon: 'solar:chart-2-bold-duotone' }
    });

    const { glnumbers, glOptions, isLoading: isLoadingGl } = useReferenceGlnumbers();
    const { colors, isLoading: isLoadingColors } = useReferenceColors();

    const {
        formData,
        updateField,
        errors,
        totalSizeQty,
        orderQtyNum,
        isSizeMatch,
        handleAddEmptySizeRow,
        handleUpdateSize,
        handleRemoveSize,
        handleSubmit
    } = useLayingPlanningForm();

    const colorOptions = colors.map((c: any) => ({
        id: c.id.toString(),
        label: c.standard_name || c.code || 'Unknown Color'
    }));

    // Reusable Error Component
    const ErrorMsg = ({ msg }: { msg?: string }) => {
        if (!msg) return null;
        return <span className="text-red-500 text-[10px] font-bold mt-1 block">{msg}</span>;
    };

    const CheckboxCard = ({ title, options, stateKey }: { title: string, options: string[], stateKey: keyof LayingPlanningFormData }) => {
        const selectedValues = formData[stateKey] as string[];
        return (
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{title}</label>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
                    {options.map((opt) => {
                        const isSelected = selectedValues.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                    if (isSelected) {
                                        updateField(stateKey, selectedValues.filter(v => v !== opt) as any);
                                    } else {
                                        updateField(stateKey, [...selectedValues, opt] as any);
                                    }
                                }}
                                className={cn(
                                    "h-14 rounded-xl border flex items-center justify-between px-4 transition-all text-left group",
                                    isSelected 
                                        ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20" 
                                        : "bg-zinc-50 border-zinc-100 hover:border-zinc-200",
                                    errors[stateKey] && "border-red-300 bg-red-50"
                                )}
                            >
                                <span className={cn("text-[12px] font-bold", isSelected ? "text-blue-700" : "text-zinc-600 group-hover:text-zinc-900")}>{opt}</span>
                                <div className={cn(
                                    "w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-all",
                                    isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-300",
                                    errors[stateKey] && !isSelected && "border-red-300"
                                )}>
                                    {isSelected && <Icon icon="solar:check-read-bold" className="w-3 h-3 text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <ErrorMsg msg={errors[stateKey]} />
            </div>
        );
    };

    const RadioCard = ({ title, options, stateKey }: { title: string, options: string[], stateKey: keyof LayingPlanningFormData }) => (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">{title}</label>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
                {options.map((opt) => {
                    const isSelected = formData[stateKey] === opt;
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => updateField(stateKey, opt as any)}
                            className={cn(
                                "h-14 rounded-xl border flex items-center justify-between px-4 transition-all text-left group",
                                isSelected 
                                    ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20" 
                                    : "bg-zinc-50 border-zinc-100 hover:border-zinc-200",
                                errors[stateKey] && "border-red-300 bg-red-50"
                            )}
                        >
                            <span className={cn("text-[12px] font-bold", isSelected ? "text-blue-700" : "text-zinc-600 group-hover:text-zinc-900")}>{opt}</span>
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
                        
                        {/* SECTION A: GENERAL INFO */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">A. Reference Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Select
                                        label="GL Number (Garment Reference)"
                                        placeholder={isLoadingGl ? "Loading GL Numbers..." : "Select GL Number..."}
                                        options={glOptions}
                                        value={formData.gl_number_id}
                                        onChange={(val) => {
                                            const selectedGl = glnumbers.find((gl: any) => gl.id.toString() === val.toString());
                                            // Batch update fields directly in the hook's update method or using a loop.
                                            // For simplicity here, we update them sequentially (React handles batching).
                                            updateField('gl_number_id', val.toString());
                                            updateField('style', selectedGl?.style_no || '');
                                            updateField('buyer', selectedGl?.brand || '');
                                            updateField('order_qty', selectedGl?.gmt_qty ? selectedGl.gmt_qty.toString() : '');
                                            updateField('plan_date', selectedGl?.order_date || new Date().toISOString().split('T')[0]);
                                            updateField('delivery_date', selectedGl?.delivery_date || '');
                                        }}
                                        disabled={isLoadingGl}
                                    />
                                    <ErrorMsg msg={errors.gl_number_id} />
                                </div>

                                {formData.gl_number_id && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Style Number</label>
                                            <input className={cn("w-full h-12 bg-zinc-50 border rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none", errors.style ? "border-red-300" : "border-zinc-100")} placeholder="Style..." value={formData.style} onChange={(e) => updateField('style', e.target.value)} />
                                            <ErrorMsg msg={errors.style} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Description / Notes</label>
                                            <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-[13px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-12" placeholder="Description..." value={formData.description} onChange={(e) => updateField('description', e.target.value)} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Buyer</label>
                                            <input className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold text-zinc-500 cursor-not-allowed" readOnly value={formData.buyer} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Colors Setup</label>
                                            <MultiSelect options={colorOptions} value={formData.selected_colors} onChange={(val) => updateField('selected_colors', val as string[])} placeholder={isLoadingColors ? "Loading..." : "Search/Type..."} disabled={isLoadingColors} creatable={true} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Order Quantity</label>
                                            <input type="number" className={cn("w-full h-12 bg-zinc-50 border rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none", errors.order_qty ? "border-red-300" : "border-zinc-100")} value={formData.order_qty} onChange={(e) => updateField('order_qty', e.target.value)} />
                                            <ErrorMsg msg={errors.order_qty} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Plan Date</label>
                                            <input type="date" className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={formData.plan_date} onChange={(e) => updateField('plan_date', e.target.value)} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Delivery Date</label>
                                            <input type="date" className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" value={formData.delivery_date} onChange={(e) => updateField('delivery_date', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fabric PO</label>
                                            <input className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Enter Fabric PO..." value={formData.fabric_po} onChange={(e) => updateField('fabric_po', e.target.value)} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* SECTION B: FABRIC CONSUMPTION */}
                        {formData.gl_number_id && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">B. Fabric Consumption</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Portion</label>
                                        <input className={cn("w-full h-12 bg-zinc-50 border rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none", errors.portion ? "border-red-300" : "border-zinc-100")} placeholder="E.g., Self, Combo 1..." value={formData.portion} onChange={(e) => updateField('portion', e.target.value)} />
                                        <ErrorMsg msg={errors.portion} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quantity Consumed</label>
                                            <div className="relative">
                                                <input type="number" step="0.01" className={cn("w-full h-12 bg-zinc-50 border rounded-xl pl-4 pr-12 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none", errors.qty_consumed ? "border-red-300" : "border-zinc-100")} placeholder="0.00" value={formData.qty_consumed} onChange={(e) => updateField('qty_consumed', e.target.value)} />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Yard</span>
                                            </div>
                                            <ErrorMsg msg={errors.qty_consumed} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fabric Type</label>
                                            <input className={cn("w-full h-12 bg-zinc-50 border rounded-xl px-4 text-[13px] font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none", errors.fabric_type ? "border-red-300" : "border-zinc-100")} placeholder="E.g., Single Jersey..." value={formData.fabric_type} onChange={(e) => updateField('fabric_type', e.target.value)} />
                                            <ErrorMsg msg={errors.fabric_type} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Consumption Description</label>
                                        <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-[13px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24" placeholder="Fabric usage description..." value={formData.consumption_description} onChange={(e) => updateField('consumption_description', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Fabric Type Content</label>
                                        <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-[13px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24" placeholder="E.g., 100% Cotton..." value={formData.fabric_type_content} onChange={(e) => updateField('fabric_type_content', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION C: CLASSIFICATIONS */}
                        {formData.gl_number_id && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">C. Classifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <CheckboxCard title="Part Type" options={['Top', 'Pants', 'Tank Top', 'Jacket']} stateKey="part_types" />
                                    <RadioCard title="Fabric Pattern" options={['Solid', 'Stripe']} stateKey="fabric_pattern" />
                                    <RadioCard title="Laying Planning Type" options={['BODY', 'COMBINASI', 'INTERLINING']} stateKey="laying_planning_type" />
                                </div>
                            </div>
                        )}

                        {/* SECTION D: LIST SIZE */}
                        {formData.gl_number_id && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">D. List Size Breakdown</h3>
                                    
                                    <div className={cn(
                                        "px-3 py-1 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-colors",
                                        isSizeMatch ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        <span>Order: {orderQtyNum}</span>
                                        <span>/</span>
                                        <span>Allocated: {totalSizeQty}</span>
                                        <Icon icon={isSizeMatch ? "solar:check-circle-bold" : "solar:danger-triangle-bold"} className="w-3.5 h-3.5" />
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
                                            {formData.sizes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">No sizes added yet</td>
                                                </tr>
                                            ) : (
                                                formData.sizes.map((sz) => (
                                                    <tr key={sz.id} className="hover:bg-zinc-50/50 transition-colors group">
                                                        <td className="px-6 py-2">
                                                            <input 
                                                                className="w-full h-10 bg-transparent border-b border-transparent group-hover:border-zinc-200 focus:border-blue-500 text-[13px] font-bold text-zinc-900 px-2 outline-none transition-all placeholder:text-zinc-300"
                                                                placeholder="E.g. S, M, L..."
                                                                value={sz.name}
                                                                onChange={(e) => handleUpdateSize(sz.id, 'name', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-2">
                                                            <input 
                                                                type="number"
                                                                className="w-24 h-10 bg-transparent border-b border-transparent group-hover:border-zinc-200 focus:border-blue-500 text-[13px] font-bold text-zinc-900 px-2 outline-none transition-all placeholder:text-zinc-300"
                                                                placeholder="0"
                                                                value={sz.qty === 0 ? '' : sz.qty}
                                                                onChange={(e) => handleUpdateSize(sz.id, 'qty', parseInt(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-2 text-center">
                                                            <button type="button" onClick={() => handleRemoveSize(sz.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-50 group-hover:opacity-100">
                                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="bg-zinc-900 text-white">
                                            <tr>
                                                <td className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-right text-white/50">Total Allocated</td>
                                                <td className="px-6 py-3 text-[14px] font-bold text-white">{totalSizeQty}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <ErrorMsg msg={errors.sizes} />

                                <div className="flex justify-end">
                                    <Button type="button" onClick={handleAddEmptySizeRow} className="h-10 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                        <Icon icon="solar:add-circle-bold" className="w-4 h-4 mr-2 inline text-zinc-400" /> Add Size Row
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* SECTION E: REMARK */}
                        {formData.gl_number_id && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">E. Additional Notes</h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Remark (Optional)</label>
                                    <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-[13px] font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24 placeholder:text-zinc-400" placeholder="Any final remarks..." value={formData.remark} onChange={(e) => updateField('remark', e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* FOOTER */}
                        <div className="pt-8 flex justify-end gap-4 border-t border-zinc-100 sticky bottom-0 bg-white p-4 -mx-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-b-[2rem] z-10">
                            <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-500">Cancel</Button>
                            <Button 
                                type="button" 
                                onClick={handleSubmit}
                                className={cn(
                                    "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all",
                                    !formData.gl_number_id ? "bg-zinc-200 text-zinc-400 shadow-none cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                                )}
                            >
                                Save Planning
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}