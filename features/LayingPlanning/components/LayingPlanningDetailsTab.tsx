import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { LayingPlanningDetailForm } from './LayingPlanningDetailForm';

interface LayingPlanningDetailsTabProps {
    sizes: any[];
    details: any[];
    detailTypes: any[];
    isLoading: boolean;
    createDetail: (payload: any) => Promise<boolean>;
    updateDetail: (id: string | number, payload: any) => Promise<boolean>;
    deleteDetail: (id: string | number) => Promise<boolean>;
    isFullyAllocated: boolean;
}

export const LayingPlanningDetailsTab = ({ 
    sizes,
    details,
    detailTypes,
    isLoading,
    createDetail,
    updateDetail,
    deleteDetail,
    isFullyAllocated
}: LayingPlanningDetailsTabProps) => {

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDetail, setEditingDetail] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);

    useEffect(() => {
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFormOpen]);

    const handleAdd = () => {
        setEditingDetail(null);
        setIsFormOpen(true);
    };

    const handleEdit = (detail: any) => {
        setEditingDetail(detail);
        setIsFormOpen(true);
    };

    const handleDelete = async (detailId: string | number) => {
        if (!confirm('Are you sure you want to delete this detail?')) return;
        setIsDeletingId(detailId);
        await deleteDetail(detailId);
        setIsDeletingId(null);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        let success = false;
        
        if (editingDetail) {
            success = await updateDetail(editingDetail.id, data);
        } else {
            success = await createDetail(data);
        }

        setIsSubmitting(false);
        if (success) {
            setIsFormOpen(false);
            setEditingDetail(null);
        }
        return success;
    };

    if (isLoading && !details.length) {
        return (
            <div className="flex justify-center p-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const renderFormModal = () => {
        if (!isFormOpen) return null;

        const modalContent = (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white border border-zinc-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Icon icon={editingDetail ? 'solar:pen-bold-duotone' : 'solar:add-circle-bold-duotone'} className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">{editingDetail ? 'Edit Laying Detail' : 'Add New Laying Detail'}</h3>
                                <p className="text-sm text-zinc-500 font-medium">Configure marker code, yards, and size ratio allocations.</p>
                            </div>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => { setIsFormOpen(false); setEditingDetail(null); }} className="h-10 w-10 p-0 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
                            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                        </Button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <LayingPlanningDetailForm
                            initialData={editingDetail}
                            sizes={sizes}
                            allDetails={details}
                            detailTypes={detailTypes}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setIsFormOpen(false);
                                setEditingDetail(null);
                            }}
                            isLoading={isSubmitting}
                        />
                    </div>
                </div>
            </div>
        );

        if (typeof document !== 'undefined') {
            return createPortal(modalContent, document.body);
        }
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Laying Details Layout</h3>
                    <p className="text-sm font-bold text-zinc-700">Total Records: {details.length}</p>
                </div>
                {!isFullyAllocated && (
                    <Button onClick={handleAdd} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                        <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5 mr-2" /> 
                        Add Detail
                    </Button>
                )}
            </div>

            <div className="grid gap-4">
                {details.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50/50 rounded-2xl border border-zinc-100/80">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-zinc-100 mb-4 text-zinc-300">
                            <Icon icon="solar:document-add-bold-duotone" className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-zinc-900 mb-1">No Details Found</h4>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                            {isFullyAllocated 
                                ? "All sizes have been fully allocated. You cannot add more details." 
                                : "You haven't added any laying planning details yet. Click the button above to create one."}
                        </p>
                        {!isFullyAllocated && (
                            <Button onClick={handleAdd} variant="ghost" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                Add First Detail
                            </Button>
                        )}
                    </div>
                ) : (
                    details.map((detail: any, index: number) => (
                        <div key={detail.id} className="group p-5 bg-white border border-zinc-100 hover:border-blue-200 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 text-blue-700 rounded-xl font-black text-lg">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-base font-bold text-zinc-900">{detail.marker_code}</h4>
                                            {detail.is_pilot_run && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                                    <Icon icon="solar:star-bold" className="w-3 h-3" /> Pilot
                                                </span>
                                            )}
                                            {detail.type?.detail_type && (
                                                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                    {detail.type.detail_type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-[13px] text-zinc-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-blue-400" /> {detail.layer_qty} Layers</span>
                                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                            <span>{detail.marker_yard} YD {detail.marker_inch}"</span>
                                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                            <span>Allowance: {detail.allowance_inch}"</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button onClick={() => handleEdit(detail)} variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg">
                                        <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        onClick={() => handleDelete(detail.id)} 
                                        disabled={isDeletingId === detail.id}
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg"
                                    >
                                        {isDeletingId === detail.id ? (
                                            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                        ) : (
                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Sizes Display */}
                            {detail.sizes && detail.sizes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap gap-2">
                                    {detail.sizes.map((sz: any) => (
                                        <div key={sz.id} className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-bold text-zinc-700">
                                            <span className="text-zinc-400">{sz.size_name || 'Size'}:</span>
                                            <span className="text-blue-600">{sz.ratio_per_size}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {renderFormModal()}
        </div>
    );
};
