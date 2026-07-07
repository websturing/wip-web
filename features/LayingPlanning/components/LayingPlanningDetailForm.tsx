import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Select } from '@/app/components/ui/Select';
import { ReferenceService } from '../../Reference/services/ReferenceService';
import { useEffect, useState } from 'react';

interface LayingPlanningDetailFormProps {
    initialData?: any;
    sizes: any[];
    detailTypes: any[];
    allDetails: any[];
    onSubmit: (data: any) => Promise<boolean>;
    onCancel: () => void;
    onError?: (msg: string) => void;
    isLoading?: boolean;
}

export const LayingPlanningDetailForm = ({
    initialData,
    sizes,
    detailTypes,
    allDetails,
    onSubmit,
    onCancel,
    onError,
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
        })),
        materials: [] as any[]
    });

    const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

    useEffect(() => {
        if (formData.materials.length > 0 && !formData.materials.find(m => m.id === activeMaterialId)) {
            setActiveMaterialId(formData.materials[0].id);
        } else if (formData.materials.length === 0) {
            setActiveMaterialId(null);
        }
    }, [formData.materials, activeMaterialId]);

    const [colors, setColors] = useState<any[]>([]);
    const [fabrics, setFabrics] = useState<any[]>([]);
    const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    useEffect(() => {
        const fetchRefs = async () => {
            setIsFetchingRefs(true);
            try {
                const [colRes, fabRes] = await Promise.all([
                    ReferenceService.getColors(1, ''),
                    ReferenceService.getFabrics(1, '')
                ]);
                if (colRes.status === 'success') {
                    setColors(colRes.data.data.map((c: any) => ({ id: c.id, label: c.standard_name || c.name || c.color_name || 'Unknown Color' })));
                }
                if (fabRes.status === 'success') {
                    setFabrics(fabRes.data.data.map((f: any) => ({ id: f.id, label: f.standard_content || f.name || 'Unknown Fabric' })));
                }
            } catch (err) {
                console.error('Failed to load refs', err);
            } finally {
                setIsFetchingRefs(false);
            }
        };
        fetchRefs();
    }, []);

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
                }),
                materials: initialData.materials ? initialData.materials.map((m: any) => ({
                    id: m.id || Math.random().toString(36).substring(7),
                    laying_planning_detail_type_id: m.laying_planning_detail_type_id || '',
                    value_per_layer: m.value_per_layer || '',
                    unit: m.unit || 'meter',
                    color_id: m.color_id || '',
                    fabric_id: m.fabric_id || '',
                    marker_code: m.properties?.marker_code || '',
                    marker_yard: m.properties?.marker_yard || '',
                    marker_inch: m.properties?.marker_inch || '',
                    use_parent_marker: !m.properties?.marker_code
                })) : []
            });
        }
    }, [initialData, sizes]);

    // Set default detail type to "Normal" for new records
    useEffect(() => {
        if (!initialData && detailTypes?.length > 0) {
            setFormData(prev => {
                if (!prev.laying_planning_detail_type_id) {
                    const normalType = detailTypes.find((t: any) => t.detail_type?.toLowerCase() === 'normal');
                    return normalType ? { ...prev, laying_planning_detail_type_id: normalType.id } : prev;
                }
                return prev;
            });
        }
    }, [initialData, detailTypes]);

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

    const handleAddMaterial = () => {
        if (formData.materials.length >= 3) return;
        const newId = Math.random().toString(36).substring(7);
        setFormData(prev => ({
            ...prev,
            materials: [
                ...prev.materials,
                {
                    id: newId,
                    laying_planning_detail_type_id: '',
                    value_per_layer: '',
                    unit: 'yard',
                    color_id: '',
                    fabric_id: '',
                    marker_code: '',
                    marker_yard: '',
                    marker_inch: '',
                    use_parent_marker: true
                }
            ]
        }));
        setActiveMaterialId(newId);
    };

    const handleRemoveMaterial = (id: string) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.filter(m => m.id !== id)
        }));
    };

    const handleMaterialChange = (id: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            materials: prev.materials.map(m =>
                m.id === id ? { ...m, [field]: value } : m
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
                if (onError) {
                    onError(`Error: Size ${sizeData?.size?.size || 'Unknown'} exceeds remaining quantity by ${currentRatio - remaining}. (Max allowed: ${remaining})`);
                }
                hasError = true;
                break;
            }
        }

        if (hasError) return;

        const formattedMaterials = formData.materials.map(m => {
            const props: any = {};
            if (m.use_parent_marker) {
                if (formData.marker_code) props.marker_code = formData.marker_code;
                if (formData.marker_yard) props.marker_yard = parseFloat(formData.marker_yard) || 0;
                if (formData.marker_inch) props.marker_inch = parseFloat(formData.marker_inch) || 0;
            } else {
                if (m.marker_code) props.marker_code = m.marker_code;
                if (m.marker_yard) props.marker_yard = parseFloat(m.marker_yard) || 0;
                if (m.marker_inch) props.marker_inch = parseFloat(m.marker_inch) || 0;
            }
            
            return {
                laying_planning_detail_type_id: m.laying_planning_detail_type_id,
                value_per_layer: parseFloat(m.value_per_layer) || 0,
                unit: m.unit,
                color_id: m.color_id || null,
                fabric_id: m.fabric_id || null,
                ...(Object.keys(props).length > 0 ? { properties: props } : {})
            };
        });

        const payload = {
            ...formData,
            layer_qty: parseInt(formData.layer_qty),
            marker_yard: parseInt(formData.marker_yard),
            marker_inch: parseFloat(formData.marker_inch),
            allowance_inch: parseFloat(formData.allowance_inch),
            sizes: filteredSizes,
            materials: formattedMaterials
        };

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Detail Type <span className="text-red-500">*</span></label>
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(140px, 1fr))` }}>
                    {detailTypes.map((type: any) => {
                        const isSelected = formData.laying_planning_detail_type_id == type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => handleChange('laying_planning_detail_type_id', type.id)}
                                className={`h-14 rounded-xl border flex items-center justify-between px-4 transition-all text-left group ${isSelected
                                        ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20"
                                        : "bg-zinc-50 border-zinc-100 hover:border-zinc-200"
                                    }`}
                            >
                                <span className={`text-[12px] font-bold ${isSelected ? "text-blue-700" : "text-zinc-600 group-hover:text-zinc-900"}`}>
                                    {type.detail_type}
                                </span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-500 bg-blue-500" : "border-zinc-300"
                                    }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

            {/* Materials Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-5 h-5 text-blue-500" />
                        <h4 className="text-sm font-bold text-zinc-800">Materials (Accessories / Binding)</h4>
                    </div>
                    {formData.materials.length < 3 && (
                        <Button type="button" onClick={handleAddMaterial} size="sm" variant="ghost" className="text-xs">
                            <Icon icon="solar:add-circle-bold" className="w-4 h-4 mr-1 text-blue-500" />
                            Add Material
                        </Button>
                    )}
                </div>
                
                <div className="space-y-4">
                    {formData.materials.length === 0 && (
                        <div className="text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                            <span className="text-sm text-zinc-500">No additional materials.</span>
                        </div>
                    )}
                    
                    {formData.materials.length > 0 && (
                        <div>
                            <div className="flex border-b border-zinc-200 overflow-x-auto hide-scrollbar mb-4">
                                {formData.materials.map((m, idx) => {
                                    const typeName = detailTypes.find(t => t.id == m.laying_planning_detail_type_id)?.detail_type || `Material ${idx + 1}`;
                                    const isActive = m.id === activeMaterialId;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setActiveMaterialId(m.id)}
                                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                                                isActive 
                                                    ? 'border-blue-600 text-blue-600' 
                                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
                                            }`}
                                        >
                                            {typeName}
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.materials.map((material, idx) => {
                                if (material.id !== activeMaterialId) return null;
                                return (
                                    <div key={material.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-4 relative group">
                                        <div className="absolute top-4 right-4 z-10">
                                            <button type="button" onClick={() => handleRemoveMaterial(material.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Remove material">
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                            </button>
                                        </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                                <Select
                                    label="Material Type *"
                                    options={detailTypes.filter(t => (t.detail_type || '').toLowerCase() !== 'normal').map(t => ({ id: t.id, label: t.detail_type || 'Unknown Type' }))}
                                    value={material.laying_planning_detail_type_id}
                                    onChange={(v) => handleMaterialChange(material.id, 'laying_planning_detail_type_id', v)}
                                />
                                
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Value / Layer *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full h-12 px-4 bg-white border border-zinc-100 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all"
                                        placeholder="0.00"
                                        value={material.value_per_layer}
                                        onChange={(e) => handleMaterialChange(material.id, 'value_per_layer', e.target.value)}
                                    />
                                </div>

                                <Select
                                    label="Unit *"
                                    options={[
                                        { id: 'yard', label: 'Yard' },
                                        { id: 'pcs', label: 'Pcs' }
                                    ]}
                                    value={material.unit}
                                    onChange={(v) => handleMaterialChange(material.id, 'unit', v)}
                                />

                                <Select
                                    label="Color"
                                    options={colors}
                                    value={material.color_id}
                                    onChange={(v) => handleMaterialChange(material.id, 'color_id', v)}
                                    placeholder="Optional"
                                />

                                <Select
                                    label="Fabric"
                                    options={fabrics}
                                    value={material.fabric_id}
                                    onChange={(v) => handleMaterialChange(material.id, 'fabric_id', v)}
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="pt-4 border-t border-zinc-200">
                                <label className="flex items-center space-x-2 cursor-pointer mb-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-blue-600 rounded border-zinc-300 focus:ring-blue-500"
                                        checked={material.use_parent_marker}
                                        onChange={(e) => handleMaterialChange(material.id, 'use_parent_marker', e.target.checked)}
                                    />
                                    <span className="text-sm text-zinc-700 font-medium">Use Parent Marker Yard & Code</span>
                                </label>
                                
                                {!material.use_parent_marker && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Properties: Marker Code</label>
                                            <input
                                                type="text"
                                                className="w-full h-12 px-4 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all"
                                                placeholder="Optional"
                                                value={material.marker_code}
                                                onChange={(e) => handleMaterialChange(material.id, 'marker_code', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Properties: Marker Yard</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full h-12 px-4 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all"
                                                placeholder="0"
                                                value={material.marker_yard}
                                                onChange={(e) => handleMaterialChange(material.id, 'marker_yard', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Properties: Marker Inch</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full h-12 px-4 bg-white border border-zinc-100 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-200 transition-all"
                                                placeholder="0.00"
                                                value={material.marker_inch}
                                                onChange={(e) => handleMaterialChange(material.id, 'marker_inch', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                                );
                            })}
                        </div>
                    )}
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
