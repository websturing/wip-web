'use client';

import { Button } from '@/app/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout, Operation, TimeStudy } from '../types';

interface IeLayoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    layout?: IeLayout | null;
    onSuccess: () => void;
}

export const IeLayoutDialog = ({ open, onOpenChange, layout, onSuccess }: IeLayoutDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);

    const [formData, setFormData] = useState<Partial<IeLayout>>({
        name: '',
        price: 0,
        department: 'Sewing',
        is_gl_number: true,
        gl_number: '',
        details: []
    });

    useEffect(() => {
        if (open) {
            fetchOperations();
            if (layout) {
                setFormData({
                    ...layout,
                    details: layout.details || []
                });
            } else {
                setFormData({
                    name: '',
                    price: 0,
                    department: 'Sewing',
                    is_gl_number: true,
                    gl_number: '',
                    details: []
                });
            }
        }
    }, [open, layout]);

    const fetchOperations = async () => {
        try {
            const data = await IeLayoutService.getOperations();
            setOperations(data);
        } catch (error) {
            console.error('Failed to fetch operations:', error);
        }
    };

    const addOperation = () => {
        const newDetail: any = {
            operation_id: '',
            handling_position: 'Seated',
            length: 0,
            sequence: (formData.details?.length || 0) + 1,
            machine_type: '',
            machine_turn: 0
        };
        setFormData(prev => ({
            ...prev,
            details: [...(prev.details || []), newDetail]
        }));
    };

    const removeOperation = (index: number) => {
        const newDetails = [...(formData.details || [])];
        newDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const updateDetail = (index: number, field: keyof TimeStudy, value: any) => {
        const newDetails = [...(formData.details || [])];
        (newDetails[index] as any)[field] = value;

        // If operation_id changed, auto-fill some fields
        if (field === 'operation_id') {
            const op = operations.find(o => o.id === Number(value));
            if (op) {
                newDetails[index].machine_type = op.machine_type;
                newDetails[index].sequence = op.sequence || newDetails[index].sequence;
            }
        }

        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const handleSubmit = async () => {
        if (!formData.name) return alert('Layout name is required');

        setIsLoading(true);
        try {
            if (layout?.id) {
                await IeLayoutService.update(layout.id, formData);
            } else {
                await IeLayoutService.create(formData);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save layout:', error);
            alert('Error saving layout. Check if operations exist.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="flex flex-col h-[90vh]">
                    {/* Header */}
                    <DialogHeader className="p-10 bg-zinc-900 text-white flex flex-row items-center justify-between border-b border-white/5 space-y-0 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative z-10">
                            <DialogTitle className="text-3xl font-black tracking-tight uppercase italic leading-none mb-2">
                                {layout ? 'Optimize' : 'Architect'} <span className="text-blue-400">Layout.</span>
                            </DialogTitle>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Industrial Engineering Module v2.0</p>
                        </div>
                        <button onClick={() => onOpenChange(false)} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 transition-all active:scale-95 outline-none relative z-10">
                            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                        </button>
                    </DialogHeader>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar bg-zinc-50/50">
                        {/* Section 1: Core Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Architectural Name / Identifier</label>
                                <input
                                    className="w-full bg-white border border-zinc-100 h-16 rounded-[1.5rem] px-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-lg text-zinc-900 shadow-sm"
                                    placeholder="e.g. SEWING LINE A - VEST"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Department Scope</label>
                                <Select
                                    placeholder="Scope Selection..."
                                    options={[
                                        { id: 'Sewing', label: 'SEWING / ASSEMBLY' },
                                        { id: 'Cutting', label: 'CUTTING / PREP' },
                                        { id: 'Finishing', label: 'FINISHING / QC' },
                                    ]}
                                    value={formData.department || 'Sewing'}
                                    onChange={(val) => setFormData(prev => ({ ...prev, department: String(val) }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Standard Pricing / Unit</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-lg">$</div>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-zinc-100 h-16 rounded-[1.5rem] pl-12 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-lg text-zinc-900 shadow-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 md:col-span-2">
                                <div className="flex items-center justify-between ml-1 px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">GL Serial Assignment</label>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, is_gl_number: !prev.is_gl_number }))}
                                        className={cn(
                                            "text-[9px] font-extrabold uppercase px-3 py-1 rounded-full transition-all border",
                                            formData.is_gl_number ? "bg-blue-600 text-white border-blue-600" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                                        )}
                                    >
                                        {formData.is_gl_number ? '✓ ATTACHED' : 'UNATTACHED'}
                                    </button>
                                </div>
                                <input
                                    disabled={!formData.is_gl_number}
                                    className="w-full bg-white border border-zinc-100 h-16 rounded-[1.5rem] px-6 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-lg text-zinc-900 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed font-mono tracking-widest"
                                    placeholder="e.g. GL-7822-00"
                                    value={formData.gl_number || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, gl_number: e.target.value.toUpperCase() }))}
                                />
                            </div>
                        </div>

                        {/* Section 2: Operation Matrix */}
                        <div className="space-y-8 pt-10 border-t border-zinc-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase leading-none">Operation Matrix</h4>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Define sequences and time studies</p>
                                </div>
                                <Button
                                    onClick={addOperation}
                                    variant="primary"
                                    className="bg-zinc-900 text-white hover:bg-blue-600 border-none rounded-2xl px-6 h-12 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-zinc-200"
                                >
                                    <Icon icon="solar:programming-bold-duotone" className="w-5 h-5" />
                                    <span>Append Sequence</span>
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.details?.map((detail, idx) => (
                                    <div key={idx} className="group flex flex-col md:flex-row gap-4 p-8 bg-white border border-zinc-50 rounded-[2.5rem] items-center animate-in fade-in slide-in-from-right-4 transition-all hover:shadow-2xl hover:shadow-zinc-200 hover:-translate-y-1">
                                        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shrink-0 group-hover:scale-110 group-hover:bg-blue-600 transition-all">
                                            {idx + 1}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 w-full">
                                            <div className="md:col-span-4">
                                                <Select
                                                    placeholder="Select Operation..."
                                                    options={operations.map(o => ({ id: o.id, label: `[${o.code}] ${o.name}` }))}
                                                    value={detail.operation_id || ''}
                                                    onChange={(val) => updateDetail(idx, 'operation_id', val)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <input
                                                    type="number"
                                                    className="w-full bg-zinc-50 border border-zinc-100 h-10 rounded-xl px-4 font-black text-xs text-center focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    placeholder="Turn"
                                                    value={detail.machine_turn}
                                                    onChange={(e) => updateDetail(idx, 'machine_turn', Number(e.target.value))}
                                                />
                                            </div>
                                            <div className="md:col-span-3">
                                                <input
                                                    className="w-full bg-zinc-50 border border-zinc-100 h-10 rounded-xl px-4 font-bold text-[11px] uppercase focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                    placeholder="Machine Type"
                                                    value={detail.machine_type}
                                                    onChange={(e) => updateDetail(idx, 'machine_type', e.target.value)}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Select
                                                    placeholder="Pos"
                                                    options={[
                                                        { id: 'Seated', label: '🪑 SEATED' },
                                                        { id: 'Standing', label: '🚶 STANDING' },
                                                    ]}
                                                    value={detail.handling_position}
                                                    onChange={(val) => updateDetail(idx, 'handling_position', String(val))}
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex items-center justify-end">
                                                <button
                                                    onClick={() => removeOperation(idx)}
                                                    className="w-10 h-10 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center group/del_op"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!formData.details || formData.details.length === 0) && (
                                    <div className="py-20 bg-white/50 border border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-zinc-300">
                                        <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-12 h-12 mb-4 opacity-10" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Sequence empty - Architectural initialization needed</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-10 border-t border-zinc-100 bg-white flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Complexity</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-zinc-900">{formData.details?.length || 0}</span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Ops / Layout</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="px-8 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-12 h-14 bg-zinc-900 border-none hover:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Icon icon="solar:refresh-line-duotone" className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-blue-400" />
                                )}
                                <span>{layout ? 'Commit Changes' : 'Initialize Module'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Dialog>
    );
};
