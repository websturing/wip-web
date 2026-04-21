'use client';

import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/app/components/ui/Toast';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIeLayoutForm } from '../hooks/useIeLayoutForm';

// Premium Modular Components
import { FormFooterSummary } from '../components/IeLayoutForm/FormFooterSummary';
import { LayoutConfigCard } from '../components/IeLayoutForm/LayoutConfigCard';
import { LineBalancingChart } from '../components/IeLayoutForm/LineBalancingChart';
import { WorkflowSection } from '../components/IeLayoutForm/WorkflowSection';



export const IeLayoutFormPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const {
        formData, setFormData,
        availableSections, setAvailableSections,
        lots, operations,
        isFetching, isLoading,
        handleSubmit,
        addOperation, removeOperation, updateDetail,
        removeSection,
        onDragSectionStart, onDragSectionOver,
        onProcessDragStart, onProcessDragOver,
        draggedSection, setDraggedSection,
        draggedProcessIdx, setDraggedProcessIdx
    } = useIeLayoutForm(id);

    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, sectionName: string }>({ open: false, sectionName: '' });

<<<<<<< HEAD
    const addSection = () => {
        if (newSectionName && !availableSections.includes(newSectionName.toUpperCase())) {
            setAvailableSections(prev => [...prev, newSectionName.toUpperCase()]);
            setNewSectionName('');
            setIsSectionModalOpen(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }
    };

=======
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
                        const sanitizedDetails = (layoutData.details || []).map(d => ({
                            ...d,
                            section: d.section || 'INLINE',
                            handling_position_value: Number(d.handling_position_value || 0),
                            length: Number(d.length || 0),
                            machine_turn: Number(d.machine_turn || 0),
                            man_power: Number(d.man_power || 0),
                            std_time: Number(d.std_time || 0),
                            target_hour: Number(d.target_hour || 0),
                            target_day: Number(d.target_day || 0),
                            smv: Number(d.smv || 0)
                        }));
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
        const key = detail.machine_type.toUpperCase();
        const turn = MACHINE_TURNS[key] || detail.machine_turn || 0;

        const posHandling = detail.handling_position_value || 0;
        const sewLength = detail.length || 0;

        const rawStdTime = posHandling > 0 ? (sewLength * turn) + posHandling : 0;
        const stdTime = Math.ceil(rawStdTime * 100) / 100;

        const targetHour = (posHandling > 0 && stdTime > 0) ? (3600 * efficiency) / stdTime : 0;
        const targetDay = targetHour * 8;
        const smv = targetHour > 0 ? 60 / targetHour : 0;

        return {
            ...detail,
            machine_turn: turn,
            std_time: stdTime,
            target_hour: targetHour,
            target_day: targetDay,
            smv: smv
        };
    };

    const addOperation = (section: OperationSection) => {
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

    const removeOperation = (indexInDetails: number) => {
        const newDetails = [...(formData.details || [])];
        newDetails.splice(indexInDetails, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const updateDetail = (indexInDetails: number, field: keyof TimeStudy, value: any) => {
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            let detail = { ...newDetails[indexInDetails], [field]: value };

            if (field === 'operation_name') {
                const op = operations.find(o => o.name.toLowerCase() === value.toLowerCase());
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
        if (!formData.name) return alert('Layout name is required');

        // Calculate totals before saving
        const totalSmv = formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0) || 0;

        // Final data preparation
        const submitData = {
            ...formData,
            total_smv: totalSmv,
            // Ensure no circular references or extra frontend-only objects are passed if necessary
            // (The backend sanitization I added will handle this, but it's good practice)
        };

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
            alert('Error saving layout. Please verify all operations have been correctly initialized.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatInt = (num: any) => {
        const val = Number(num);
        if (isNaN(val)) return '0';
        return Math.round(val).toString();
    };

    const formatPrec = (num: any) => {
        const val = Number(num);
        if (isNaN(val) || val === 0) return '0';
        return parseFloat(val.toFixed(3)).toString();
    };

    const sectionTotals = useMemo(() => {
        const totals: Record<OperationSection, { smv: number, mp: number }> = {
            OUTLINE: { smv: 0, mp: 0 },
            OFFLINE: { smv: 0, mp: 0 },
            INLINE: { smv: 0, mp: 0 }
        };
        formData.details?.forEach(d => {
            totals[d.section].smv += (d.smv || 0);
            totals[d.section].mp += (d.man_power || 0);
        });
        return totals;
    }, [formData.details]);

>>>>>>> 1ea9ecd (-)
    if (isFetching) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin shadow-2xl"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Decoding Industrial Architecture...</span>
        </div>
    );

    return (
        <div className="pb-32">
            <ToastProvider>
                <PageHeader
                    title={id ? 'Refine Architecture' : 'Initialize IE Layout'}
                    description="Crafting the skeleton of production efficiency through high-precision time study modeling."
                    action={
                        <button
                            onClick={() => router.back()}
                            className="h-12 px-6 bg-white border border-zinc-100 text-zinc-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"
                        >
                            Back
                        </button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12 max-w-[1600px] mx-auto">
                    {/* Primary Configuration */}
                    <LayoutConfigCard
                        formData={formData}
                        lots={lots}
                        updateFormData={(data) => setFormData(prev => ({ ...prev, ...data }))}
                    />

                    {/* Real-time Line Balancing Visualization */}
                    <LineBalancingChart
                        details={formData.details || []}
                        efficiency={formData.efficiency_constant}
                    />

                    {/* Section Management Header */}

                    <div className="lg:col-span-12 flex items-center justify-between mt-6">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Workflow Arsitektur</h2>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Organize production stages for maximum line balance</p>
                        </div>
                        <button
                            onClick={() => setIsSectionModalOpen(true)}
                            className="h-10 px-5 bg-white border border-zinc-100 text-zinc-900 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Icon icon="solar:layers-bold-duotone" className="w-4 h-4" />
                            Expand Section
                        </button>
                    </div>

                    <div className="lg:col-span-12 space-y-12">
                        {availableSections.map((section) => {
                            const details = formData.details || [];
                            const sectionIndices = details
                                .map((d, i) => d.section === section ? i : -1)
                                .filter(i => i !== -1);
                            const sectionRows = sectionIndices.map(idx => details[idx]);

                            return (
                                <WorkflowSection
                                    key={section}
                                    section={section}
                                    sectionRows={sectionRows}
                                    sectionIndices={sectionIndices}
                                    draggedSection={draggedSection}
                                    draggedProcessIdx={draggedProcessIdx}
                                    onDragSectionStart={onDragSectionStart}
                                    onDragSectionOver={onDragSectionOver}
                                    onDragSectionEnd={() => setDraggedSection(null)}
                                    onProcessDragStart={onProcessDragStart}
                                    onProcessDragOver={onProcessDragOver}
                                    onProcessDragEnd={() => setDraggedProcessIdx(null)}
                                    addOperation={addOperation}
                                    removeSection={(s) => setConfirmDelete({ open: true, sectionName: s })}
                                    updateDetail={updateDetail}
                                    removeOperation={removeOperation}
                                />
                            );
                        })}
                    </div>

                    <FormFooterSummary formData={formData} />

                    <div className="lg:col-span-12 flex justify-end pb-20">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-16 px-16 bg-zinc-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-zinc-200 transition-all active:scale-95 flex items-center gap-4 disabled:opacity-50"
                        >
                            {isLoading && <Icon icon="solar:refresh-line-duotone" className="w-5 h-5 animate-spin" />}
                            <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5 text-emerald-400" />
                            <span>{isLoading ? 'Processing...' : id ? 'Commit Architecture' : 'Initialize Specs'}</span>
                        </button>
                    </div>
                </div>

                <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                    <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                        <div className="bg-zinc-900 p-10 text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tight mb-2">Initialize Section</DialogTitle>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed">Defining a new structural division within the production line.</p>
                            </DialogHeader>
                        </div>
                        <div className="p-10 bg-white">
                            <input
                                type="text"
                                className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-5 text-sm font-black text-zinc-900 placeholder:text-zinc-200 uppercase"
                                placeholder="SECTION NAME (E.G. PACKING)"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && addSection()}
                                autoFocus
                            />
                            <DialogFooter className="mt-8 gap-3">
                                <DialogClose asChild>
                                    <button className="flex-1 h-14 rounded-2xl bg-zinc-50 font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 transition-all">Cancel</button>
                                </DialogClose>
                                <button
                                    onClick={addSection}
                                    className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-200 transition-all"
                                >
                                    Confirm
                                </button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                <Toast open={showSuccessToast} onOpenChange={setShowSuccessToast} className="bg-emerald-600 border-none rounded-2xl shadow-2xl p-6">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon icon="solar:check-circle-bold" className="w-6 h-6" />
                        </div>
                        <div>
                            <ToastTitle className="text-sm font-black uppercase tracking-widest">Section Initialized</ToastTitle>
                            <ToastDescription className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Architecture expansion successful.</ToastDescription>
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
                onConfirm={() => {
                    removeSection(confirmDelete.sectionName);
                    setConfirmDelete({ open: false, sectionName: '' });
                }}
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
