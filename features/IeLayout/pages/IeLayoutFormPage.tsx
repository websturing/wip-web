'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/app/components/ui/Toast';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout, Operation, TimeStudy } from '../types';

const MACHINE_TURNS: Record<string, number> = {
    'O/L': 0.125,
    'S': 0.158,
    'C': 0.158,
    'BT': 0.158,
    'BH': 0.158,
    'O': 0.158,
    'S/M': 0.369,
    'IRON': 0.048
};

export const IeLayoutFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [lots, setLots] = useState<{ id: string, lot_code: string }[]>([]);
    const [availableSections, setAvailableSections] = useState<string[]>(['OUTLINE', 'OFFLINE', 'INLINE']);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);

    // Confirmation Dialog State
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, sectionName: string }>({ open: false, sectionName: '' });
    const [draggedSection, setDraggedSection] = useState<string | null>(null);
    const [draggedProcessIdx, setDraggedProcessIdx] = useState<number | null>(null);

    const [formData, setFormData] = useState<Partial<IeLayout>>({
        name: '',
        lot_id: '',
        price: 0,
        efficiency_constant: 1,
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
        { label: id ? 'Modify Specs' : 'Initialize Specs', icon: 'solar:add-circle-bold-duotone' },
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            setIsFetching(true);
            try {
                const [opsData, lotsData] = await Promise.all([
                    IeLayoutService.getOperations(),
                    IeLayoutService.getLots()
                ]);
                setOperations(opsData);
                setLots(lotsData);

                if (id) {
                    const layoutData = await IeLayoutService.getById(id as string);
                    if (layoutData) {
                        const efficiency = Number(layoutData.efficiency_constant || 1);

                        // Extract unique sections from loaded data and merge with defaults
                        const existingSections = Array.from(new Set((layoutData.details || []).map(d => d.section || 'INLINE')));
                        setAvailableSections(prev => Array.from(new Set([...prev, ...existingSections])));

                        const sanitizedDetails = (layoutData.details || []).map(d => {
                            const detailWithNumbers = {
                                ...d,
                                section: d.section || 'INLINE',
                                handling_position_value: Number(d.handling_position_value || 0),
                                length: Number(d.length || 0),
                                machine_turn: Number(d.machine_turn || 0),
                                man_power: Number(d.man_power || 1), // Default to 1 if missing
                            };
                            return calculateRowMetrics(detailWithNumbers, efficiency);
                        });
                        setFormData({
                            ...layoutData,
                            price: Number(layoutData.price || 0),
                            efficiency_constant: Number(layoutData.efficiency_constant || 1),
                            total_smv: Number(layoutData.total_smv || 0),
                            man_power_sewer: Number(layoutData.man_power_sewer || 0),
                            man_power_matching: Number(layoutData.man_power_matching || 0),
                            man_power_qc: Number(layoutData.man_power_qc || 0),
                            man_power_others: Number(layoutData.man_power_others || 0),
                            details: sanitizedDetails
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsFetching(false);
            }
        };
        loadInitialData();
    }, [id]);

    const calculateRowMetrics = (detail: TimeStudy, efficiency: number) => {
        const key = detail.machine_type?.toUpperCase() || '';
        const turn = MACHINE_TURNS[key] || detail.machine_turn || 0;

        const posHandling = detail.handling_position_value || 0;
        const sewLength = detail.length || 0;
        const mp = detail.man_power || 1;

        const rawStdTime = posHandling > 0 ? (sewLength * turn) + posHandling : 0;
        const stdTime = Math.ceil(rawStdTime * 100) / 100;

        // Standard Industry Formulas
        const smv = stdTime > 0 ? stdTime / 60 : 0;
        const targetHour = (stdTime > 0) ? (3600 * efficiency * mp) / stdTime : 0;
        const targetDay = targetHour * 8;

        return {
            ...detail,
            machine_turn: turn,
            std_time: stdTime,
            target_hour: targetHour,
            target_day: targetDay,
            smv: smv
        };
    };

    const addOperation = (section: string) => {
        const newDetail: TimeStudy = {
            operation_id: '',
            operation_name: '',
            section: section,
            handling_position: 'Seated',
            handling_position_value: 0,
            length: 0,
            man_power: 1,
            sequence: (formData.details?.length || 0) + 1,
            machine_type: '',
            machine_turn: 0
        };

        setFormData(prev => ({
            ...prev,
            details: [...(prev.details || []), newDetail]
        }));
    };

    const addSection = () => {
        if (newSectionName && !availableSections.includes(newSectionName.toUpperCase())) {
            setAvailableSections(prev => [...prev, newSectionName.toUpperCase()]);
            setNewSectionName('');
            setIsSectionModalOpen(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }
    };

    const removeOperation = (indexInDetails: number) => {
        const newDetails = [...(formData.details || [])];
        newDetails.splice(indexInDetails, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const removeSection = (sectionName: string) => {
        setConfirmDelete({ open: true, sectionName });
    };

    const handleConfirmDeleteSection = () => {
        const sectionName = confirmDelete.sectionName;
        setFormData(prev => ({
            ...prev,
            details: (prev.details || []).filter(d => d.section !== sectionName)
        }));
        setAvailableSections(prev => prev.filter(s => s !== sectionName));
        setConfirmDelete({ open: false, sectionName: '' });
    };

    const onDragStart = (e: React.DragEvent, section: string) => {
        setDraggedSection(section);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent, targetSection: string) => {
        e.preventDefault();
        if (draggedSection === targetSection || draggedProcessIdx !== null) return;

        const newSections = [...availableSections];
        const draggedIdx = newSections.indexOf(draggedSection!);
        const targetIdx = newSections.indexOf(targetSection);

        newSections.splice(draggedIdx, 1);
        newSections.splice(targetIdx, 0, draggedSection!);
        setAvailableSections(newSections);
    };

    const onProcessDragStart = (e: React.DragEvent, globalIdx: number) => {
        setDraggedProcessIdx(globalIdx);
        e.dataTransfer.effectAllowed = 'move';
        // Avoid conflict with section drag
        e.stopPropagation();
    };

    const onProcessDragOver = (e: React.DragEvent, targetGlobalIdx: number) => {
        e.preventDefault();
        if (draggedProcessIdx === null || draggedProcessIdx === targetGlobalIdx) return;

        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            const draggedItem = newDetails[draggedProcessIdx];

            // Ensure we are dragging within the same section or handle crossing if needed
            // For now, allow any order swap
            newDetails.splice(draggedProcessIdx, 1);
            newDetails.splice(targetGlobalIdx, 0, draggedItem);

            setDraggedProcessIdx(targetGlobalIdx); // Update current drag position
            return { ...prev, details: newDetails };
        });
    };

    const updateDetail = (indexInDetails: number, field: keyof TimeStudy, value: string | number) => {
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            let detail = { ...newDetails[indexInDetails], [field]: value };

            if (field === 'operation_name') {
                const op = operations.find(o => o.name.toLowerCase() === String(value).toLowerCase());
                if (op) {
                    detail.operation_id = op.id;
                    detail.machine_type = op.machine_type;
                    detail.sequence = op.sequence || detail.sequence;
                } else {
                    detail.operation_id = '';
                }
            }

            if (['length', 'machine_type', 'handling_position_value', 'machine_turn', 'operation_name'].includes(field as string)) {
                detail = calculateRowMetrics(detail, prev.efficiency_constant || 1);
            }

            newDetails[indexInDetails] = detail;
            return { ...prev, details: newDetails };
        });
    };

    const handleSubmit = async () => {
        if (!formData.name) return; // Silent return as name is usually picked first

        if (!formData.details || formData.details.length === 0) {
            setIsValidationDialogOpen(true);
            return;
        }

        const totalSmv = formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0) || 0;
        const submitData = { ...formData, total_smv: totalSmv };

        setIsLoading(true);
        try {
            if (id) {
                await IeLayoutService.update(id as string, submitData);
            } else {
                await IeLayoutService.create(submitData);
            }
            router.push('/admin/ielayout');
        } catch (error) {
            console.error('Failed to save layout:', error);
            alert('Error saving layout.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatInt = (num: number | string | null | undefined) => {
        const val = Number(num);
        if (isNaN(val)) return '0';
        return Math.round(val).toString();
    };

    const formatPrec = (num: number | string | null | undefined) => {
        const val = Number(num);
        if (isNaN(val) || val === 0) return '0';
        return parseFloat(val.toFixed(3)).toString();
    };

    if (isFetching) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin shadow-2xl"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 animate-pulse">Initializing Data...</span>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-1000">
            <PageHeader
                items={breadcrumbItems}
                title={id ? "Refine Architecture" : "Initialize Specs"}
                subtitle="IE Layout Design"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 pb-20 mt-6 lg:mt-10 px-4 md:px-8">
                {/* Header Config */}
                <div className="lg:col-span-12">
                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-6 lg:p-10 shadow-sm flex flex-col lg:flex-row gap-8 lg:gap-10">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">Layout Configuration</h3>
                                </div>
                                <button
                                    onClick={() => setIsSectionModalOpen(true)}
                                    className="flex items-center gap-2 text-[9px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all active:scale-95"
                                >
                                    <Icon icon="solar:add-folder-bold" className="w-3.5 h-3.5" />
                                    New Section
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Layout Identity</label>
                                    <input
                                        className="w-full bg-zinc-50 border border-zinc-100 h-11 rounded-xl px-4 focus:ring-4 focus:ring-zinc-900/5 outline-none font-bold text-xs"
                                        placeholder="Name your layout..."
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Selected Lot</label>
                                    <Select
                                        options={lots.map(l => ({ id: l.id, label: l.lot_code }))}
                                        value={formData.lot_id || ''}
                                        onChange={(val) => setFormData(prev => ({ ...prev, lot_id: String(val) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 font-mono text-blue-600">Efficiency (E$2)</label>
                                    <input
                                        type="number" step="0.01"
                                        className="w-full bg-zinc-900 text-white h-11 rounded-xl px-4 font-black text-sm"
                                        value={formData.efficiency_constant}
                                        onChange={(e) => {
                                            const newEff = Number(e.target.value);
                                            setFormData(prev => ({
                                                ...prev, efficiency_constant: newEff,
                                                details: (prev.details || []).map(d => calculateRowMetrics(d, newEff))
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Avg Price / Unit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-50 border border-zinc-100 h-11 rounded-xl px-4 font-bold text-xs"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-72 bg-zinc-900 rounded-3xl p-6 lg:p-8 flex flex-col justify-between items-center text-center text-white relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Architecture SMV</span>
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                                    {formatPrec(formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0))}
                                </span>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-2 bg-blue-500/10 px-3 py-1 rounded-full">
                                    {formData.details?.reduce((acc, d) => acc + (d.man_power || 0), 0)} MP Total
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workflow Sections */}
                <div className="lg:col-span-12 space-y-8">
                    {availableSections.map((section) => {
                        const sectionRows = formData.details?.filter(d => d.section === section) || [];
                        const sectionIndices = (formData.details || [])
                            .map((d, i) => d.section === section ? i : -1)
                            .filter(i => i !== -1);

                        const isActive = sectionRows.length > 0;

                        return (
                            <div
                                key={section}
                                draggable
                                onDragStart={(e) => onDragStart(e, section)}
                                onDragOver={(e) => onDragOver(e, section)}
                                onDragEnd={() => setDraggedSection(null)}
                                className={cn(
                                    "transition-all duration-500",
                                    !isActive && "opacity-60",
                                    draggedSection === section && "scale-[0.98] opacity-50 border-2 border-dashed border-blue-400 rounded-[2.5rem]"
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-between mb-4 px-2",
                                    draggedSection === section && "opacity-0"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white px-5 py-2 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
                                            <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
                                                <Icon icon="solar:hamburger-menu-bold" className="w-4 h-4" />
                                            </div>
                                            <span className="text-[11px] font-black text-zinc-900 tracking-[0.1em]">{section}</span>
                                            <div className="w-px h-3 bg-zinc-100"></div>
                                            <button
                                                onClick={() => removeSection(section)}
                                                className="text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-tighter"
                                            >
                                                Remove Section
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addOperation(section)}
                                        className="h-8 px-4 bg-white hover:bg-zinc-900 hover:text-white text-zinc-900 rounded-lg border border-zinc-100 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95"
                                    >
                                        <Icon icon="solar:add-circle-bold" className="w-3.5 h-3.5 text-emerald-500" />
                                        Add Process
                                    </button>
                                </div>

                                <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-zinc-100/50">
                                    <div className="overflow-x-auto no-scrollbar">
                                        <table className="w-full text-left border-collapse table-fixed">
                                            <thead>
                                                <tr className="bg-zinc-50 border-b border-zinc-100 italic">
                                                    <th className="px-4 py-2.5 w-10"></th>
                                                    <th className="px-2 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest w-[25%]">Workflow Sequence</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-14">Hdl</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-14">Sew</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-16">M/C</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-14">Trn</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-900 uppercase tracking-widest text-center w-14 bg-blue-50/50">MP</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-16 bg-emerald-50/50">STD</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-16 bg-indigo-50/50">Hrs</th>
                                                    <th className="px-1 py-2.5 text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center w-16">Day</th>
                                                    <th className="px-3 py-2.5 text-[8px] font-black text-zinc-900 uppercase tracking-widest text-right bg-zinc-50/50 w-20">SMV</th>
                                                    <th className="px-4 py-2.5 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                {sectionRows.map((detail, sIdx) => {
                                                    const globalIdx = sectionIndices[sIdx];
                                                    const isBeingDragged = draggedProcessIdx === globalIdx;

                                                    return (
                                                        <tr
                                                            key={`${section}-${sIdx}`}
                                                            draggable
                                                            onDragStart={(e) => onProcessDragStart(e, globalIdx)}
                                                            onDragOver={(e) => onProcessDragOver(e, globalIdx)}
                                                            onDragEnd={() => setDraggedProcessIdx(null)}
                                                            className={cn(
                                                                "hover:bg-zinc-50/50 transition-colors group",
                                                                isBeingDragged && "opacity-20 bg-blue-50"
                                                            )}
                                                        >
                                                            <td className="px-4 py-1.5 flex items-center gap-2">
                                                                <div className="cursor-grab active:cursor-grabbing text-zinc-200 hover:text-zinc-400 transition-colors">
                                                                    <Icon icon="solar:round-alt-arrow-down-bold-duotone" className="w-3 h-3 rotate-180" />
                                                                    <Icon icon="solar:round-alt-arrow-down-bold-duotone" className="w-3 h-3 -mt-1.5" />
                                                                </div>
                                                                <span className="text-[9px] font-black text-zinc-300">{sIdx + 1}</span>
                                                            </td>
                                                            <td className="px-2 py-1.5">
                                                                <input
                                                                    list="ops-datalist"
                                                                    className="w-full bg-transparent border-none focus:ring-0 font-black text-[11px] uppercase tracking-tight p-0 outline-none placeholder:text-zinc-200 overflow-hidden text-ellipsis whitespace-nowrap"
                                                                    placeholder="DEFINE OPERATION..."
                                                                    value={detail.operation_name || detail.operation?.name || ''}
                                                                    onChange={(e) => updateDetail(globalIdx, 'operation_name', e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center">
                                                                <input
                                                                    type="number" className="w-full bg-transparent border-none text-center text-[11px] font-black text-zinc-900 p-0"
                                                                    value={detail.handling_position_value}
                                                                    onChange={(e) => updateDetail(globalIdx, 'handling_position_value', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center">
                                                                <input
                                                                    type="number" className="w-full bg-transparent border-none text-center text-[11px] font-black text-zinc-900 p-0"
                                                                    value={detail.length}
                                                                    onChange={(e) => updateDetail(globalIdx, 'length', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center">
                                                                <input
                                                                    className="w-full bg-transparent border-none text-center text-[10px] font-black text-zinc-400 uppercase p-0"
                                                                    value={detail.machine_type}
                                                                    onChange={(e) => updateDetail(globalIdx, 'machine_type', e.target.value.toUpperCase())}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center text-[10px] font-bold text-zinc-300 italic">{formatPrec(detail.machine_turn)}</td>
                                                            <td className="px-1 py-1.5 text-center bg-blue-50/20">
                                                                <input
                                                                    type="number" step="0.5"
                                                                    className="w-full bg-transparent border-none text-center text-[11px] font-black text-blue-600 p-0"
                                                                    value={detail.man_power}
                                                                    onChange={(e) => updateDetail(globalIdx, 'man_power', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-1 py-1.5 text-center bg-emerald-50/20 font-black text-[11px] text-emerald-600">{formatPrec(detail.std_time)}</td>
                                                            <td className="px-1 py-1.5 text-center bg-indigo-50/20 font-black text-[11px] text-indigo-600 text-xs">{formatInt(detail.target_hour)}</td>
                                                            <td className="px-1 py-1.5 text-center text-[10px] font-bold text-zinc-400">{formatInt(detail.target_day)}</td>
                                                            <td className="px-3 py-1.5 text-right bg-zinc-50/20 font-black text-[11px] text-zinc-900">{formatPrec(detail.smv)}</td>
                                                            <td className="px-4 py-1.5 text-center">
                                                                <button onClick={() => removeOperation(globalIdx)} className="transition-all text-zinc-200 hover:text-red-500">
                                                                    <Icon icon="solar:trash-bin-trash-bold" className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {sectionRows.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-zinc-300 bg-zinc-50/30">
                                            <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-10 h-10 mb-2 opacity-5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic opacity-40">Drop items here or use button above</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:col-span-12 mt-12 mb-10">
                    <div className="bg-zinc-900 text-white rounded-[2.5rem] px-6 lg:px-12 py-6 lg:py-8 shadow-2xl flex flex-col md:flex-row items-center justify-between border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="flex items-center gap-10 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Architecture Productivity</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black text-white">
                                        {formatInt((() => {
                                            const totalSmv = (formData.details || []).reduce((acc, d) => acc + (d.smv || 0), 0);
                                            const totalMp = (formData.details || []).reduce((acc, d) => acc + (d.man_power || 0), 0);
                                            const eff = formData.efficiency_constant || 1;
                                            return totalSmv > 0 ? (totalMp * 60 * eff * 8) / totalSmv : 0;
                                        })())}
                                    </span>
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Units / Line / Day</span>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-12 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Manpower Metric</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-blue-400">{(formData.details || []).reduce((acc, d) => acc + (d.man_power || 0), 0)}</span>
                                    <span className="text-[9px] font-black text-white/50 uppercase">Headcount</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-8 md:mt-0 relative z-10 w-full md:w-auto">
                            <button onClick={() => router.push('/admin/ielayout')} className="px-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">Discard</button>
                            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 md:flex-none h-12 px-10 bg-blue-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/10">
                                {isLoading ? <Icon icon="solar:refresh-line-duotone" className="w-5 h-5 animate-spin" /> : <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5" />}
                                <span>{id ? 'Commit Architecture' : 'Initialize Specs'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Section Modal */}
            <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                <DialogContent className="max-w-sm bg-white border-none shadow-2xl rounded-3xl p-8">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 not-italic text-sm">Create Workflow Section</DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 block mb-2">Section Name</label>
                        <input
                            autoFocus
                            className="w-full bg-zinc-50 border border-zinc-100 h-10 rounded-xl px-4 focus:ring-4 focus:ring-zinc-900/5 outline-none font-bold text-xs uppercase"
                            placeholder="e.g. PRE-SEWING"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') addSection(); }}
                        />
                    </div>
                    <DialogFooter className="sm:justify-between gap-4">
                        <DialogClose asChild>
                            <button className="text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600 transition-colors">Cancel</button>
                        </DialogClose>
                        <button
                            onClick={addSection}
                            className="h-10 px-6 bg-zinc-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all"
                        >
                            Initialize Section
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Toast */}
            <ToastProvider>
                <Toast open={showSuccessToast} onOpenChange={setShowSuccessToast} className="bg-emerald-500 border-none text-white shadow-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <ToastTitle className="text-white normal-case text-xs">Section Ready</ToastTitle>
                            <ToastDescription className="text-white/80 text-[10px]">Workflow stage has been architected successfully.</ToastDescription>
                        </div>
                    </div>
                </Toast>
                <ToastViewport />
            </ToastProvider>

            <datalist id="ops-datalist">
                {operations.map(o => <option key={o.id} value={o.name} />)}
            </datalist>

            <ConfirmationDialog
                open={confirmDelete.open}
                onOpenChange={(open) => setConfirmDelete({ open, sectionName: '' })}
                title="Remove Section"
                description={`This will permanently remove the "${confirmDelete.sectionName}" workflow section and all processes within it. This action cannot be undone.`}
                onConfirm={handleConfirmDeleteSection}
                confirmLabel="Remove Everything"
                variant="destructive"
            />

            <ConfirmationDialog
                open={isValidationDialogOpen}
                onOpenChange={setIsValidationDialogOpen}
                title="Process Required"
                description="You cannot initialize an IE layout without any workflow processes. Please add at least one operation to proceed."
                onConfirm={() => setIsValidationDialogOpen(false)}
                confirmLabel="Understood"
            />

            <style jsx>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
