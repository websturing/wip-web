'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout, Operation, TimeStudy } from '../types';

export const IeLayoutFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [glGroups, setGlGroups] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);

    const [formData, setFormData] = useState<Partial<IeLayout>>({
        name: '',
        lot_id: '',
        price: 0,
        department: 'Sewing',
        total_smv: 0,
        man_power_sewer: 0,
        man_power_matching: 0,
        man_power_qc: 0,
        man_power_others: 0,
        details: []
    });

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Engineering', icon: 'solar:programming-bold-duotone' },
        { label: 'IE Layouts', href: '/admin/ielayout', icon: 'solar:layers-bold-duotone' },
        { label: id ? 'Edit Architecture' : 'Create Architecture', icon: 'solar:add-circle-bold-duotone' },
    ];

    useEffect(() => {
        fetchOperations();
        fetchGlGroups();
        fetchLots();
        if (id) {
            fetchLayout(id as string);
        }
    }, [id]);

    const fetchOperations = async () => {
        try {
            const data = await IeLayoutService.getOperations();
            setOperations(data);
        } catch (error) {
            console.error('Failed to fetch operations:', error);
        }
    };

    const fetchGlGroups = async () => {
        try {
            const data = await IeLayoutService.getGlNumbers();
            setGlGroups(data);
        } catch (error) {
            console.error('Failed to fetch GL groups:', error);
        }
    };

    const fetchLots = async () => {
        try {
            const data = await IeLayoutService.getLots();
            setLots(data);
        } catch (error) {
            console.error('Failed to fetch lots:', error);
        }
    };

    const fetchLayout = async (layoutId: string) => {
        setIsFetching(true);
        try {
            const data = await IeLayoutService.getById(layoutId);
            if (data) {
                setFormData({
                    ...data,
                    details: data.details || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch layout:', error);
        } finally {
            setIsFetching(false);
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
            if (id) {
                await IeLayoutService.update(id as string, formData);
            } else {
                await IeLayoutService.create(formData);
            }
            router.push('/admin/ielayout');
        } catch (error) {
            console.error('Failed to save layout:', error);
            alert('Error saving layout.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Loading Architecture Specs...</span>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-1000">
            <PageHeader
                items={breadcrumbItems}
                title={id ? "Optimize Layout" : "Architect Layout"}
                subtitle="Engineering Specification"
                description="Design the complete production flow, including manpower allocation and machine matrix."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-32">
                {/* Left Sidebar: Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
                                <Icon icon="solar:settings-bold-duotone" className="w-4 h-4" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Core Config</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Layout Name</label>
                                <input
                                    className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-zinc-900"
                                    placeholder="e.g. SEWING LINE A - VEST"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Department Scope</label>
                                <Select
                                    options={[
                                        { id: 'Sewing', label: 'SEWING / ASSEMBLY' },
                                        { id: 'Cutting', label: 'CUTTING / PREP' },
                                        { id: 'Finishing', label: 'FINISHING / QC' },
                                    ]}
                                    value={formData.department || 'Sewing'}
                                    onChange={(val) => setFormData(prev => ({ ...prev, department: String(val) }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Price / Unit</label>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm text-zinc-900"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                />
                            </div>

                            <div className="pt-6 border-t border-zinc-100 space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">GL-Lot Bound</label>
                                        <Select
                                            placeholder="SELECT GL & LOT REFERENCE..."
                                            options={lots.map(l => ({
                                                id: l.id,
                                                label: l.lot_code || `${l.gl_number}-${l.lot_number}`,
                                                gl: l.gl_number
                                            }))}
                                            value={formData.lot_id || ''}
                                            onChange={(val) => {
                                                const selectedLot = lots.find(l => l.id === val);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    lot_id: String(val),
                                                    // If name is empty, auto-fill with lot code
                                                    name: prev.name ? prev.name : (selectedLot?.lot_code || '')
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance & Man Power Card */}
                    <div className="bg-zinc-900 rounded-[2rem] p-8 shadow-2xl shadow-zinc-200/50 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                                <Icon icon="solar:chart-2-bold-duotone" className="w-4 h-4" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Performance & MP</h3>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Total SMV</label>
                                    <span className="text-[8px] font-black bg-blue-600 px-2 py-0.5 rounded text-white italic">Flexible Input</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-5 focus:outline-none focus:bg-white/10 transition-all font-black text-lg text-white"
                                    value={formData.total_smv}
                                    onChange={(e) => setFormData(prev => ({ ...prev, total_smv: Number(e.target.value) }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sewer MP</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 focus:outline-none focus:bg-white/10 transition-all font-bold text-sm text-white"
                                        value={formData.man_power_sewer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, man_power_sewer: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Matching MP</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 focus:outline-none focus:bg-white/10 transition-all font-bold text-sm text-white"
                                        value={formData.man_power_matching}
                                        onChange={(e) => setFormData(prev => ({ ...prev, man_power_matching: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">QC MP</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 focus:outline-none focus:bg-white/10 transition-all font-bold text-sm text-white"
                                        value={formData.man_power_qc}
                                        onChange={(e) => setFormData(prev => ({ ...prev, man_power_qc: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Others MP</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 focus:outline-none focus:bg-white/10 transition-all font-bold text-sm text-white"
                                        value={formData.man_power_others}
                                        onChange={(e) => setFormData(prev => ({ ...prev, man_power_others: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Workers</span>
                                <span className="text-3xl font-black text-blue-400">
                                    {(Number(formData.man_power_sewer) || 0) +
                                        (Number(formData.man_power_matching) || 0) +
                                        (Number(formData.man_power_qc) || 0) +
                                        (Number(formData.man_power_others) || 0)}
                                </span>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <Icon icon="solar:users-group-rounded-bold" className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content: Operation Matrix */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-10 shadow-sm min-h-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-3">Operation Matrix</h3>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Detailed Process Sequence & Time Study
                                </p>
                            </div>
                            <Button
                                onClick={addOperation}
                                className="h-14 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-zinc-200 flex items-center gap-3 group"
                            >
                                <Icon icon="solar:programming-bold-duotone" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                <span>Append Process</span>
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.details?.map((detail, idx) => (
                                <div key={idx} className="group flex flex-col md:flex-row gap-6 p-6 bg-zinc-50/50 border border-zinc-100 rounded-3xl items-center hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300 animate-in fade-in slide-in-from-right-4">
                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:bg-blue-600 transition-colors shrink-0">
                                        {idx + 1}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 w-full">
                                        <div className="md:col-span-3 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 opacity-60">Process Select</label>
                                            <Select
                                                placeholder="Process..."
                                                options={operations.map(o => ({ id: o.id, label: `[${o.code}] ${o.name}` }))}
                                                value={detail.operation_id || ''}
                                                onChange={(val) => updateDetail(idx, 'operation_id', val)}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-60 ml-1">M/C Turn</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 font-black text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                value={detail.machine_turn}
                                                onChange={(e) => updateDetail(idx, 'machine_turn', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-60 ml-1">Machine Class</label>
                                            <input
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 font-bold text-[11px] uppercase focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                placeholder="M/C TYPE"
                                                value={detail.machine_type}
                                                onChange={(e) => updateDetail(idx, 'machine_type', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-60 ml-1">Length (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 font-black text-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                value={detail.length}
                                                onChange={(e) => updateDetail(idx, 'length', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-60 ml-1">Ergonomics</label>
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
                                        <div className="md:col-span-1 flex items-end justify-end pb-1">
                                            <button
                                                onClick={() => removeOperation(idx)}
                                                className="w-10 h-10 bg-white text-zinc-200 hover:bg-red-50 hover:text-red-500 rounded-xl border border-zinc-100 transition-all flex items-center justify-center group/del_op shadow-sm"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5 group-hover/del_op:scale-110" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!formData.details || formData.details.length === 0) && (
                                <div className="py-32 bg-zinc-50 border border-dashed border-zinc-200 rounded-[3rem] flex flex-col items-center justify-center text-zinc-300">
                                    <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-16 h-16 mb-6 opacity-5" />
                                    <p className="text-[11px] font-black uppercase tracking-widest italic">Process Matrix Empty</p>
                                    <p className="text-[9px] font-bold text-zinc-200 uppercase mt-2">Append your first process to start architecture</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Bar - Docked Style */}
            <div className="sticky bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-zinc-100 px-10 py-6 mt-12 mb-[-32px] mx-[-40px] flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1">Architecture Status</span>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-zinc-900 text-xs font-black uppercase tracking-widest">Validated & Ready</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/ielayout')}
                        className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
                    >
                        Discard Changes
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="h-12 px-10 bg-zinc-900 hover:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Icon icon="solar:refresh-line-duotone" className="w-5 h-5 animate-spin" />
                        ) : (
                            <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-blue-400" />
                        )}
                        <span>{id ? 'Commit Architecture' : 'Initialize Layout'}</span>
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
