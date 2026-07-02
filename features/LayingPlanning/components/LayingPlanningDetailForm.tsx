import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

interface LayingPlanningDetailFormProps {
    initialData?: any;
    sizes: any[];
    detailTypes: any[];
    allDetails: any[];
    onSubmit: (data: any) => Promise<boolean>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const LayingPlanningDetailForm = ({
    initialData,
    sizes,
    detailTypes,
    allDetails,
    onSubmit,
    onCancel,
    isLoading
}: LayingPlanningDetailFormProps) => {
    const [formData, setFormData] = useState({
        laying_planning_detail_type_id: '',
        layer_qty: '',
        marker_code: '',
        marker_yard: '',
        marker_inch: '',
        allowance_inch: '',
        is_pilot_run: false,
        sizes: sizes.map(sz => ({
            size_id: sz.size_id || sz.id,
            ratio_per_size: ''
        }))
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                laying_planning_detail_type_id: initialData.laying_planning_detail_type_id || '',
                layer_qty: initialData.layer_qty || '',
                marker_code: initialData.marker_code || '',
                marker_yard: initialData.marker_yard || '',
                marker_inch: initialData.marker_inch || '',
                allowance_inch: initialData.allowance_inch || '',
                is_pilot_run: initialData.is_pilot_run || false,
                sizes: sizes.map(sz => {
                    const existingSize = initialData.sizes?.find((es: any) => es.size_id === (sz.size_id || sz.id));
                    return {
                        size_id: sz.size_id || sz.id,
                        ratio_per_size: existingSize ? existingSize.ratio_per_size : ''
                    };
                })
            });
        }
    }, [initialData, sizes]);

    const [totalCutMap, setTotalCutMap] = useState<Record<string, number>>({});

    useEffect(() => {
        const cuts: Record<string, number> = {};
        allDetails.forEach((detail: any) => {
            // skip the detail currently being edited
            if (initialData && detail.id === initialData.id) return;
            
            detail.sizes?.forEach((sz: any) => {
                const sid = sz.size_id || sz.id;
                cuts[sid] = (cuts[sid] || 0) + (parseInt(sz.ratio_per_size) || 0);
            });
        });
        setTotalCutMap(cuts);
    }, [allDetails, initialData]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSizeChange = (sizeId: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map(sz => 
                sz.size_id === sizeId ? { ...sz, ratio_per_size: value } : sz
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const layerQty = parseInt(formData.layer_qty) || 0;
        let hasError = false;

        const filteredSizes = formData.sizes.filter(sz => sz.ratio_per_size && parseInt(sz.ratio_per_size) > 0);

        // Validate
        for (const sz of filteredSizes) {
            const sizeData = sizes.find(s => (s.size_id || s.id) === sz.size_id);
            const orderQty = sizeData?.order_qty || 0;
            const previousCut = totalCutMap[sz.size_id] || 0;
            const remaining = orderQty - previousCut;
            const currentRatio = parseInt(sz.ratio_per_size) || 0;
            
            if (currentRatio > remaining) {
                alert(`Error: Size ${sizeData?.size?.size || 'Unknown'} exceeds remaining quantity by ${currentRatio - remaining}. (Max allowed: ${remaining})`);
                hasError = true;
                break;
            }
        }

        if (hasError) return;
        
        const payload = {
            ...formData,
            layer_qty: parseInt(formData.layer_qty),
            marker_yard: parseInt(formData.marker_yard),
            marker_inch: parseFloat(formData.marker_inch),
            allowance_inch: parseFloat(formData.allowance_inch),
            sizes: filteredSizes
        };
        
        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Detail Type</label>
                    <select
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        value={formData.laying_planning_detail_type_id}
                        onChange={(e) => handleChange('laying_planning_detail_type_id', e.target.value)}
                    >
                        <option value="">Select Type</option>
                        {detailTypes.map((type: any) => (
                            <option key={type.id} value={type.id}>
                                {type.detail_type} {type.description ? `(${type.description})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Marker Code <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="e.g. M-01"
                        value={formData.marker_code}
                        onChange={(e) => handleChange('marker_code', e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Layer Qty <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0"
                        value={formData.layer_qty}
                        onChange={(e) => handleChange('layer_qty', e.target.value)}
                    />
                </div>

                <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer group mb-1">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${formData.is_pilot_run ? 'bg-blue-600 border-blue-600' : 'bg-zinc-50 border-zinc-300 group-hover:border-blue-400'}`}>
                            {formData.is_pilot_run && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={formData.is_pilot_run}
                            onChange={(e) => handleChange('is_pilot_run', e.target.checked)}
                        />
                        <span className="text-sm font-bold text-zinc-700 select-none group-hover:text-zinc-900">Pilot Run</span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-zinc-50/80 rounded-xl border border-zinc-100">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Marker Yard <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        required
                        min="0"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0"
                        value={formData.marker_yard}
                        onChange={(e) => handleChange('marker_yard', e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Marker Inch <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        value={formData.marker_inch}
                        onChange={(e) => handleChange('marker_inch', e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Allowance Inch <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        value={formData.allowance_inch}
                        onChange={(e) => handleChange('allowance_inch', e.target.value)}
                    />
                </div>
            </div>

            {/* Sizes Ratio Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Icon icon="solar:pie-chart-2-bold-duotone" className="w-5 h-5 text-blue-500" />
                    <h4 className="text-sm font-bold text-zinc-800">Ratio per Size</h4>
                </div>
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Size</th>
                                <th className="px-4 py-3 text-center">Order Qty</th>
                                <th className="px-4 py-3 text-center">Remaining</th>
                                <th className="px-4 py-3 text-center w-32">Ratio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sizes.map((sz: any) => {
                                const sizeId = sz.size_id || sz.id;
                                const sizeName = typeof sz.size === 'string' ? sz.size : (sz.size?.size || sz.size?.size_code || sz.size?.name || 'Unknown');
                                const orderQty = sz.order_qty || 0;
                                const previousCut = totalCutMap[sizeId] || 0;
                                const remaining = orderQty - previousCut;
                                
                                const formSize = formData.sizes.find(s => s.size_id === sizeId);
                                const currentRatio = parseInt(formSize?.ratio_per_size || '0') || 0;
                                
                                const isExceeding = currentRatio > remaining;
                                
                                return (
                                    <tr key={sizeId} className={isExceeding ? 'bg-red-50/50' : 'hover:bg-zinc-50/50'}>
                                        <td className="px-4 py-3 font-bold text-zinc-800">{sizeName}</td>
                                        <td className="px-4 py-3 text-center text-zinc-600">{orderQty}</td>
                                        <td className="px-4 py-3 text-center text-zinc-600 font-medium">{remaining}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                className={`w-full px-3 py-1.5 text-center bg-white border ${isExceeding ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-600' : 'border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20'} rounded-lg text-sm font-bold focus:outline-none focus:ring-2 transition-all`}
                                                placeholder="0"
                                                value={formSize?.ratio_per_size || ''}
                                                onChange={(e) => handleSizeChange(sizeId, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
                <Button type="button" onClick={onCancel} variant="ghost" className="px-5 font-bold text-zinc-600 hover:bg-zinc-100">
                    Cancel
                </Button>
                <Button type="submit" className="px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30" disabled={isLoading}>
                    {isLoading ? 'Saving...' : initialData ? 'Update Detail' : 'Save Detail'}
                </Button>
            </div>
        </form>
    );
};
