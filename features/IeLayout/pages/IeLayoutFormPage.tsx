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

    const addSection = () => {
        if (newSectionName && !availableSections.includes(newSectionName.toUpperCase())) {
            setAvailableSections(prev => [...prev, newSectionName.toUpperCase()]);
            setNewSectionName('');
            setIsSectionModalOpen(false);
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
        }
    };

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
