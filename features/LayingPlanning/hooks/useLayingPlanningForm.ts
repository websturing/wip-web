import { useState, useMemo } from 'react';

export interface SizeEntry {
    id: string;
    name: string;
    qty: number;
}

export interface LayingPlanningFormData {
    gl_number_id: string;
    style: string;
    buyer: string;
    order_qty: string;
    plan_date: string;
    delivery_date: string;
    description: string;
    fabric_po: string;
    selected_colors: string[];
    
    portion: string;
    qty_consumed: string;
    fabric_type: string;
    consumption_description: string;
    fabric_type_content: string;

    part_types: string[]; 
    fabric_pattern: string; 
    laying_planning_type: string; 
    remark: string;

    sizes: SizeEntry[];
}

export const useLayingPlanningForm = () => {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<LayingPlanningFormData>({
        gl_number_id: '',
        style: '',
        buyer: '',
        order_qty: '',
        plan_date: today,
        delivery_date: '',
        description: '',
        fabric_po: '',
        selected_colors: [],
        
        portion: '',
        qty_consumed: '',
        fabric_type: '',
        consumption_description: '',
        fabric_type_content: '',

        part_types: [], 
        fabric_pattern: '', 
        laying_planning_type: '', 
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

        if (!formData.gl_number_id) newErrors.gl_number_id = 'GL Number is required';
        if (!formData.order_qty) newErrors.order_qty = 'Order Quantity is required';
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

    const handleSubmit = async () => {
        if (!validate()) {
            return false;
        }

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
        handleSubmit
    };
};
