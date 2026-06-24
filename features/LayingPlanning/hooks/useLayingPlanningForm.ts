import { useState, useMemo } from 'react';

export interface SizeEntry {
    id: string;
    size_id: string;
    order_qty: number;
}

export interface LayingPlanningFormData {
    lot_id: string;
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
    sizes: SizeEntry[];
}

export const useLayingPlanningForm = () => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<LayingPlanningFormData>({
        lot_id: '',
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
        sizes: []
    });

    const [errors, setErrors] = useState<Partial<Record<keyof LayingPlanningFormData, string>>>({});

    // Derived states
    const totalSizeQty = useMemo(() => formData.sizes.reduce((acc, curr) => acc + (curr.order_qty || 0), 0), [formData.sizes]);
    const orderQtyNum = parseInt(formData.order_qty) || 0;
    const isSizeMatch = totalSizeQty === orderQtyNum && orderQtyNum > 0;

    const handleAddEmptySizeRow = () => {
        const newSize = {
            id: Math.random().toString(36).substr(2, 9),
            size_id: '',
            order_qty: 0
        };
        setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
    };

    const handleUpdateSize = (id: string, field: 'size_id' | 'order_qty', value: string | number) => {
        setFormData({
            ...formData,
            sizes: formData.sizes.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
    };

    const handleRemoveSize = (id: string) => {
        if (formData.sizes.length <= 1) return;
        setFormData({ ...formData, sizes: formData.sizes.filter(s => s.id !== id) });
    };

    const updateField = <K extends keyof LayingPlanningFormData>(field: K, value: LayingPlanningFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof LayingPlanningFormData, string>> = {};

        if (!formData.lot_id) newErrors.lot_id = 'Lot is required';
        if (!formData.laying_planning_type_id) newErrors.laying_planning_type_id = 'Planning Type is required';
        if (formData.is_combine && !formData.laying_planning_parent_id) {
            newErrors.laying_planning_parent_id = 'Parent Planning is required when combine is true';
        }
        if (!formData.color_id) newErrors.color_id = 'Color is required';
        if (!formData.fabric_id) newErrors.fabric_id = 'Fabric is required';
        if (!formData.plan_date) newErrors.plan_date = 'Plan Date is required';
        if (!formData.fabric_pattern) newErrors.fabric_pattern = 'Fabric Pattern is required';
        
        if (!formData.sizes || formData.sizes.length === 0) {
            newErrors.sizes = 'At least one size must be allocated';
        } else if (formData.sizes.some(s => !s.size_id || s.order_qty <= 0)) {
            newErrors.sizes = 'All size rows must have a valid size selected and quantity greater than 0';
        } else if (!isSizeMatch) {
            newErrors.sizes = 'Total allocated sizes must match Order Quantity';
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
            console.log('VALIDATED PAYLOAD PREPARED FOR SUBMISSION:', formData);
            const { LayingPlanningService } = await import('../services/LayingPlanningService');
            
            const result = await LayingPlanningService.create(formData);
            
            if (result.status === 'success' || result.data) {
                alert('Form submitted successfully!');
                return true;
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
        orderQtyNum,
        isSizeMatch,
        handleAddEmptySizeRow,
        handleUpdateSize,
        handleRemoveSize,
        triggerValidation,
        handleFinalSubmit
    };
};
