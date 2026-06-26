import { useState, useMemo } from 'react';

export interface SizeEntry {
    id: string;
    size_id: string;
    order_qty: number;
}

export interface LayingPlanningFormData {
    lot_ids: string[];
    buyer: string;
    order_qty: string;
    laying_planning_type_id: string;
    laying_planning_parent_id: string;
    color_id: string;
    color_alias: string;
    fabric_id: string;
    fabric_alias: string;
    plan_date: string;
    fabric_pattern: string;
    is_combine: boolean;
    is_set_item: boolean;
    parts: {
        id: string;
        item_part: string;
        item_part_group_code?: string;
    }[];
    set_item_group_code_link: string;
    sizes: Record<string, SizeEntry[]>;
}

export const useLayingPlanningForm = () => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<LayingPlanningFormData>({
        lot_ids: [],
        buyer: '',
        order_qty: '',
        laying_planning_type_id: '',
        laying_planning_parent_id: '',
        color_id: '',
        color_alias: '',
        fabric_id: '',
        fabric_alias: '',
        plan_date: today,
        fabric_pattern: '',
        is_combine: false,
        is_set_item: false,
        parts: [],
        set_item_group_code_link: '',
        sizes: {}
    });

    const [errors, setErrors] = useState<Partial<Record<keyof LayingPlanningFormData, string>>>({});

    // Derived states
    const totalSizeQty = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.entries(formData.sizes).forEach(([lotId, sizes]) => {
            totals[lotId] = sizes.reduce((acc, curr) => acc + (curr.order_qty || 0), 0);
        });
        return totals;
    }, [formData.sizes]);

    const handleAddEmptySizeRow = (lotId: string) => {
        const newSize = {
            id: Math.random().toString(36).substr(2, 9),
            size_id: '',
            order_qty: 0
        };
        setFormData(prev => ({ 
            ...prev, 
            sizes: {
                ...prev.sizes,
                [lotId]: [...(prev.sizes[lotId] || []), newSize]
            }
        }));
    };

    const handleUpdateSize = (lotId: string, id: string, field: 'size_id' | 'order_qty', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            sizes: {
                ...prev.sizes,
                [lotId]: (prev.sizes[lotId] || []).map(s => s.id === id ? { ...s, [field]: value } : s)
            }
        }));
    };

    const handleRemoveSize = (lotId: string, id: string) => {
        if (!formData.sizes[lotId] || formData.sizes[lotId].length <= 1) return;
        setFormData(prev => ({
            ...prev,
            sizes: {
                ...prev.sizes,
                [lotId]: prev.sizes[lotId].filter(s => s.id !== id)
            }
        }));
    };

    const handleTogglePart = (partName: string) => {
        setFormData(prev => {
            const hasPart = prev.parts.some(p => p.item_part === partName);
            let newParts;
            if (hasPart) {
                newParts = prev.parts.filter(p => p.item_part !== partName);
            } else {
                newParts = [...prev.parts, {
                    id: Math.random().toString(36).substr(2, 9),
                    item_part: partName
                }];
            }
            const is_set_item = newParts.length > 1 ? true : (newParts.length === 1 ? prev.is_set_item : false);
            return { ...prev, parts: newParts, is_set_item };
        });
    };

    const updateField = <K extends keyof LayingPlanningFormData>(field: K, value: LayingPlanningFormData[K]) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'lot_ids') {
                const lots = value as string[];
                if (lots.length > 1) {
                    next.is_combine = true;
                }
                const newSizes = { ...prev.sizes };
                lots.forEach(lotId => {
                    if (!newSizes[lotId]) {
                        newSizes[lotId] = [{
                            id: Math.random().toString(36).substr(2, 9),
                            size_id: '',
                            order_qty: 0
                        }];
                    }
                });
                Object.keys(newSizes).forEach(lotId => {
                    if (!lots.includes(lotId)) {
                        delete newSizes[lotId];
                    }
                });
                next.sizes = newSizes;
            }
            return next;
        });
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof LayingPlanningFormData, string>> = {};

        if (!formData.lot_ids || formData.lot_ids.length === 0) newErrors.lot_ids = 'At least one Lot is required';
        if (!formData.laying_planning_type_id) newErrors.laying_planning_type_id = 'Planning Type is required';
        if (formData.is_combine && formData.lot_ids.length <= 1 && !formData.laying_planning_parent_id) {
            newErrors.laying_planning_parent_id = 'Parent Planning is required when combine is true';
        }
        if (!formData.color_id) newErrors.color_id = 'Color is required';
        if (!formData.fabric_id) newErrors.fabric_id = 'Fabric is required';
        if (!formData.plan_date) newErrors.plan_date = 'Plan Date is required';
        if (!formData.fabric_pattern) newErrors.fabric_pattern = 'Fabric Pattern is required';
        
        let sizesValid = true;
        let sizesError = '';
        if (!formData.lot_ids || formData.lot_ids.length === 0) {
            sizesValid = false;
        } else {
            for (const lotId of formData.lot_ids) {
                const lotSizes = formData.sizes[lotId];
                if (!lotSizes || lotSizes.length === 0) {
                    sizesValid = false;
                    sizesError = 'At least one size must be allocated for each selected lot';
                    break;
                } else if (lotSizes.some(s => !s.size_id || s.order_qty <= 0)) {
                    sizesValid = false;
                    sizesError = 'All size rows must have a valid size selected and quantity greater than 0';
                    break;
                }
            }
        }

        if (!sizesValid && sizesError) {
            newErrors.sizes = sizesError as any;
        }

        if (formData.is_set_item && (!formData.parts || formData.parts.length === 0)) {
            newErrors.parts = 'At least one part must be added for Set Item';
        } else if (formData.is_set_item && formData.parts.some(p => !p.item_part)) {
            newErrors.parts = 'Item Part Name is required for all parts';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const triggerValidation = (): boolean => {
        return validate();
    };

    const handleFinalSubmit = async () => {
        if (!validate()) return false;
        
        try {
            const { LayingPlanningService } = await import('../services/LayingPlanningService');
            
            // Map set_item_group_code_link into parts array if it exists
            const processedFormData = { ...formData };
            if (processedFormData.is_set_item && processedFormData.set_item_group_code_link) {
                processedFormData.parts = processedFormData.parts.map(p => ({
                    ...p,
                    item_part_group_code: processedFormData.set_item_group_code_link
                }));
            }
            
            let payload: any;
            if (processedFormData.lot_ids.length > 1) {
                payload = processedFormData.lot_ids.map(lotId => ({
                    ...processedFormData,
                    lot_id: lotId,
                    is_combine: true,
                    laying_planning_parent_id: null,
                    sizes: processedFormData.sizes[lotId] || []
                }));
                payload.forEach((p: any) => {
                    delete p.lot_ids;
                    delete p.set_item_group_code_link;
                });
            } else {
                const singleLotId = processedFormData.lot_ids[0];
                const singlePayload: any = { 
                    ...processedFormData, 
                    lot_id: singleLotId,
                    sizes: processedFormData.sizes[singleLotId] || []
                };
                delete singlePayload.lot_ids;
                delete singlePayload.set_item_group_code_link;
                payload = [singlePayload];
            }

            console.log('VALIDATED PAYLOAD PREPARED FOR SUBMISSION:', payload);
            const result = await LayingPlanningService.create(payload);
            
            if (result.status === 'success' || result.data) {
                let createdId = null;
                if (Array.isArray(result.data) && result.data.length > 0) {
                    createdId = result.data[0].id;
                } else if (result.data && result.data.id) {
                    createdId = result.data.id;
                }
                return createdId || true;
            } else {
                throw new Error(result.message || 'Unknown error occurred');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            alert(`Failed to save Laying Planning: ${error.message || 'Check console for details'}`);
            return false;
        }
    };

    return {
        formData,
        setFormData,
        updateField,
        errors,
        totalSizeQty,
        handleAddEmptySizeRow,
        handleUpdateSize,
        handleRemoveSize,
        handleTogglePart,
        triggerValidation,
        handleFinalSubmit
    };
};
