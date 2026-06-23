import { useState, useMemo } from 'react';

export interface SizeEntry {
    id: string;
    name: string;
    qty: number;
}

export interface ColorEntry {
    id: string;
    system_color_id: string;
    system_color_name: string;
    marker_alias: string;
    is_same_as_standard?: boolean;
}

export interface LayingPlanningFormData {
    gl_number_ids: string[];
    style: string;
    buyer: string;
    order_qty: string;
    plan_date: string;
    delivery_date: string;
    description: string;
    fabric_po: string;
    colors: ColorEntry[];
    
    portion: string;
    qty_consumed: string;
    fabric_type: string;
    consumption_description: string;
    fabric_type_content: string;

    part_types: string[]; 
    fabric_pattern: string; 
    laying_planning_type: string; 
    
    is_linked_set: boolean;
    parent_laying_planning_id: string;

    remark: string;

    sizes: SizeEntry[];
}

export const useLayingPlanningForm = () => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<LayingPlanningFormData>({
        gl_number_ids: [],
        style: '',
        buyer: '',
        order_qty: '',
        plan_date: today,
        delivery_date: '',
        description: '',
        fabric_po: '',
        colors: [],
        
        portion: '',
        qty_consumed: '',
        fabric_type: '',
        consumption_description: '',
        fabric_type_content: '',

        part_types: [], 
        fabric_pattern: '', 
        laying_planning_type: '', 
        
        is_linked_set: false,
        parent_laying_planning_id: '',

        remark: '',

        sizes: []
    });

    const [errors, setErrors] = useState<Partial<Record<keyof LayingPlanningFormData, string>>>({});

    // Derived states
    const totalSizeQty = useMemo(() => formData.sizes.reduce((acc, curr) => acc + (curr.qty || 0), 0), [formData.sizes]);
    const orderQtyNum = parseInt(formData.order_qty) || 0;
    const isSizeMatch = totalSizeQty === orderQtyNum && orderQtyNum > 0;

    const handleAddEmptySizeRow = () => {
        const newSize = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            qty: 0
        };
        setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
    };

    const handleUpdateSize = (id: string, field: 'name' | 'qty', value: string | number) => {
        setFormData({
            ...formData,
            sizes: formData.sizes.map(s => s.id === id ? { ...s, [field]: value } : s)
        });
    };

    const handleRemoveSize = (id: string) => {
        if (formData.sizes.length <= 1) return;
        setFormData({ ...formData, sizes: formData.sizes.filter(s => s.id !== id) });
    };

    const handleAddEmptyColorRow = () => {
        const newColor: ColorEntry = {
            id: Math.random().toString(36).substr(2, 9),
            system_color_id: '',
            system_color_name: '',
            marker_alias: '',
            is_same_as_standard: false
        };
        setFormData({ ...formData, colors: [...formData.colors, newColor] });
    };

    const handleUpdateColor = (id: string, field: keyof ColorEntry, value: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map(c => c.id === id ? { ...c, [field]: value } : c)
        }));
    };

    const handleUpdateColorFields = (id: string, updates: Partial<ColorEntry>) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.map(c => {
                if (c.id === id) {
                    const newColor = { ...c, ...updates };
                    if (newColor.is_same_as_standard && newColor.system_color_name) {
                        newColor.marker_alias = newColor.system_color_name;
                    }
                    return newColor;
                }
                return c;
            })
        }));
    };

    const handleRemoveColor = (id: string) => {
        if (formData.colors.length <= 1) return;
        setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c.id !== id) }));
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

        if (!formData.gl_number_ids || formData.gl_number_ids.length === 0) newErrors.gl_number_ids = 'At least one GL Number is required';
        if (formData.is_linked_set && !formData.parent_laying_planning_id) newErrors.parent_laying_planning_id = 'Parent Laying Planning is required';
        if (!formData.order_qty) newErrors.order_qty = 'Order Quantity is required';
        if (!formData.colors || formData.colors.length === 0) newErrors.colors = 'At least one Color must be configured';
        if (formData.colors.some(c => !c.system_color_name)) newErrors.colors = 'System color must be selected or typed for all rows';
        if (!formData.portion) newErrors.portion = 'Portion is required';
        if (!formData.qty_consumed) newErrors.qty_consumed = 'Quantity Consumed is required';
        if (!formData.fabric_type) newErrors.fabric_type = 'Fabric Type is required';
        if (formData.part_types.length === 0) newErrors.part_types = 'At least one Part Type must be selected';
        if (!formData.fabric_pattern) newErrors.fabric_pattern = 'Fabric Pattern is required';
        if (!formData.laying_planning_type) newErrors.laying_planning_type = 'Laying Planning Type is required';

        if (!isSizeMatch) {
            newErrors.sizes = 'Total allocated sizes must match Order Quantity';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const triggerValidation = (): boolean => {
        return validate();
    };

    const handleFinalSubmit = async () => {
        console.log('VALIDATED PAYLOAD PREPARED FOR SUBMISSION:', formData);
        alert('Form validated successfully! Payload logged to console.');
        // TODO: Call actual API endpoint once backend is ready
        return true;
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
        handleAddEmptyColorRow,
        handleUpdateColor,
        handleUpdateColorFields,
        handleRemoveColor,
        triggerValidation,
        handleFinalSubmit
    };
};
