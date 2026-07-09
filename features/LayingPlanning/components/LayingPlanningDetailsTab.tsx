import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as Popover from '@radix-ui/react-popover';
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
    const [warehouseDetails, setWarehouseDetails] = useState<any[] | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | number | null>(null);
    
    // New states for search, multi-select, and view mode
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDetailIds, setSelectedDetailIds] = useState<(string | number)[]>([]);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
    const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

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

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeletingId(deleteConfirmId);
        
        try {
            const success = await deleteDetail(deleteConfirmId);
            if (success) {
                setToastMessage({ text: 'Detail deleted successfully!', type: 'success' });
            } else {
                setToastMessage({ text: 'Failed to delete detail.', type: 'error' });
            }
        } catch (error) {
            setToastMessage({ text: 'An error occurred while deleting.', type: 'error' });
        } finally {
            setIsDeletingId(null);
            setDeleteConfirmId(null);
        }
    };

    const handleDelete = (detailId: string | number) => {
        setDeleteConfirmId(detailId);
    };

    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        let success = false;
        
        try {
            if (editingDetail) {
                success = await updateDetail(editingDetail.id, data);
            } else {
                success = await createDetail(data);
            }

            if (success) {
                setToastMessage({ text: editingDetail ? 'Detail updated successfully!' : 'Detail saved successfully!', type: 'success' });
                setIsFormOpen(false);
                setEditingDetail(null);
            } else {
                setToastMessage({ text: 'Failed to save detail.', type: 'error' });
            }
        } catch (error) {
            setToastMessage({ text: 'An error occurred while saving.', type: 'error' });
        } finally {
            setIsSubmitting(false);
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
                            onError={(msg) => setToastMessage({ text: msg, type: 'error' })}
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

    const filteredDetails = details.filter((detail: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return detail.marker_code?.toLowerCase().includes(q) || 
               detail.table_number?.toString().includes(q) ||
               detail.type?.detail_type?.toLowerCase().includes(q);
    });

    const toggleSelectAll = () => {
        if (selectedDetailIds.length === filteredDetails.length) {
            setSelectedDetailIds([]);
        } else {
            setSelectedDetailIds(filteredDetails.map((d: any) => d.id));
        }
    };

    const toggleSelect = (id: string | number) => {
        if (selectedDetailIds.includes(id)) {
            setSelectedDetailIds(selectedDetailIds.filter(selId => selId !== id));
        } else {
            setSelectedDetailIds([...selectedDetailIds, id]);
        }
    };

    const renderWarehouseModal = () => {
        if (!warehouseDetails || warehouseDetails.length === 0) return null;

        let aggregatedTotalYard = 0;
        let aggregatedLayers = 0;
        const tableNumbers = warehouseDetails.map(d => d.table_number || '-');

        warehouseDetails.forEach(detail => {
            const layerQty = parseInt(detail.layer_qty) || 0;
            const totalYard = detail.total_length || 0;
            
            aggregatedTotalYard += totalYard;
            aggregatedLayers += layerQty;
        });

        const modalContent = (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white border border-zinc-100 rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                                 <Icon icon="solar:box-bold-duotone" className="w-7 h-7" />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-zinc-900">Material Request</h3>
                                 <p className="text-sm text-zinc-500 font-medium">
                                     {warehouseDetails.length > 1 ? `Multiple Tables (${warehouseDetails.length})` : `Table ${tableNumbers[0]} • ${warehouseDetails[0].marker_code}`}
                                 </p>
                             </div>
                         </div>
                         <Button type="button" variant="ghost" onClick={() => setWarehouseDetails(null)} className="h-10 w-10 p-0 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100">
                            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                         </Button>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 mb-1 flex items-center gap-1.5"><Icon icon="solar:pie-chart-3-bold-duotone" className="w-4 h-4" /> Total Required</p>
                                <p className="text-3xl font-black text-indigo-600">{aggregatedTotalYard.toFixed(2)} <span className="text-sm font-bold text-indigo-400">Yards</span></p>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 rounded-2xl shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/80 mb-1 flex items-center gap-1.5"><Icon icon="solar:layers-bold-duotone" className="w-4 h-4" /> Spread Layers</p>
                                <p className="text-3xl font-black text-blue-600">{aggregatedLayers} <span className="text-sm font-bold text-blue-400">Layers</span></p>
                            </div>
                        </div>

                        {warehouseDetails.length > 1 && (
                            <div className="text-sm text-zinc-600 font-medium bg-zinc-50 px-4 py-2.5 rounded-lg border border-zinc-100">
                                <span className="font-bold text-zinc-900">Included Tables:</span> {tableNumbers.join(', ')}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                                <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4 text-zinc-400" />
                                Instructions for Warehouse
                            </label>
                            <textarea 
                                rows={3} 
                                placeholder="Add any specific instructions like fabric shading requests, roll priorities, etc..."
                                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-zinc-700 placeholder:text-zinc-400"
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 border-t border-zinc-100 flex items-center justify-end gap-3 bg-zinc-50/50 rounded-b-[2rem]">
                        <Button variant="ghost" onClick={() => setWarehouseDetails(null)} className="h-12 px-6 font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-xl transition-colors">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            setWarehouseDetails(null);
                            setSelectedDetailIds([]);
                        }} className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                            <Icon icon="solar:plain-2-bold-duotone" className="w-5 h-5" />
                            Send to Warehouse
                        </Button>
                    </div>
                </div>
            </div>
        );

        if (typeof document !== 'undefined') {
            return createPortal(modalContent, document.body);
        }
        return null;
    };

    const renderDeleteConfirmModal = () => {
        if (!deleteConfirmId) return null;
        return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Detail</h3>
                    <p className="text-sm text-zinc-500 mb-8">Are you sure you want to delete this laying detail? This action cannot be undone.</p>
                    
                    <div className="flex items-center gap-3 w-full">
                        <Button variant="ghost" onClick={() => setDeleteConfirmId(null)} className="flex-1 h-11 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl">Cancel</Button>
                        <Button onClick={confirmDelete} disabled={isDeletingId === deleteConfirmId} className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/30">
                            {isDeletingId === deleteConfirmId ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const renderToast = () => {
        if (!toastMessage) return null;
        return createPortal(
            <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <Icon icon={toastMessage.type === 'success' ? 'solar:check-circle-bold-duotone' : 'solar:danger-circle-bold-duotone'} className="w-6 h-6" />
                    <span className="text-sm font-bold">{toastMessage.text}</span>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-4 gap-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Laying Details Layout</h3>
                    <p className="text-sm font-bold text-zinc-700">Total Records: {details.length}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* Search Filter */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Icon icon="solar:magnifer-linear" className="w-4 h-4 text-zinc-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search marker or type..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-700"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600">
                                <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-zinc-100/80 p-1 rounded-xl shrink-0 border border-zinc-200/50">
                        <button 
                            onClick={() => setViewMode('table')} 
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50'}`}
                            title="Table View"
                        >
                            <Icon icon="solar:list-bold" className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('card')} 
                            className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50'}`}
                            title="Card View"
                        >
                            <Icon icon="solar:widget-5-bold" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bulk Request Material Action */}
                    {selectedDetailIds.length > 0 && (
                        <Button 
                            onClick={() => {
                                const selected = details.filter(d => selectedDetailIds.includes(d.id));
                                setWarehouseDetails(selected);
                            }} 
                            className="h-10 px-4 text-[11px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all rounded-xl flex items-center gap-2 w-full sm:w-auto shrink-0 animate-in fade-in zoom-in-95 duration-200"
                        >
                            <Icon icon="solar:box-bold-duotone" className="w-4 h-4" /> 
                            Req Material ({selectedDetailIds.length})
                        </Button>
                    )}

                    {/* Add Detail */}
                    <Button onClick={handleAdd} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 w-full sm:w-auto shrink-0">
                        <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5 mr-2" /> 
                        Add Detail
                    </Button>
                </div>
            </div>

            {/* Select All Checkbox (Only for card view since table has its own) */}
            {filteredDetails.length > 0 && viewMode === 'card' && (
                <div className="flex items-center px-2 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleSelectAll(); }}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${selectedDetailIds.length > 0 && selectedDetailIds.length === filteredDetails.length ? 'bg-indigo-600 border-indigo-600' : 'bg-zinc-50 border-zinc-300 group-hover:border-indigo-400'}`}>
                            {selectedDetailIds.length > 0 && selectedDetailIds.length === filteredDetails.length && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors">Select All ({filteredDetails.length})</span>
                    </label>
                </div>
            )}

            <div className={viewMode === 'card' ? "grid gap-4" : ""}>
                {filteredDetails.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50/50 rounded-2xl border border-zinc-100/80">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-zinc-100 mb-4 text-zinc-300">
                            <Icon icon="solar:document-add-bold-duotone" className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-zinc-900 mb-1">No Details Found</h4>
                        <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
                            {isFullyAllocated 
                                ? "All sizes have been fully allocated. You can still add more details if needed." 
                                : "You haven't added any laying planning details yet. Click the button above to create one."}
                        </p>
                        <Button onClick={handleAdd} variant="ghost" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            Add First Detail
                        </Button>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="px-4 py-3 w-12 text-center">
                                            <button onClick={toggleSelectAll} className={`w-5 h-5 rounded flex items-center justify-center border mx-auto transition-all ${selectedDetailIds.length > 0 && selectedDetailIds.length === filteredDetails.length ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300 hover:border-indigo-400'}`}>
                                                {selectedDetailIds.length > 0 && selectedDetailIds.length === filteredDetails.length && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3">No</th>
                                        <th className="px-4 py-3">Marker / Type</th>
                                        <th className="px-4 py-3">Layers</th>
                                        <th className="px-4 py-3">Length</th>
                                        <th className="px-4 py-3">Total Yard</th>
                                        <th className="px-4 py-3">Sizes</th>
                                        <th className="px-4 py-3">Materials</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredDetails.map((detail: any, index: number) => {
                                        const isSelected = selectedDetailIds.includes(detail.id);
                                        const layerQty = parseInt(detail.layer_qty) || 0;
                                        const markerLengthYard = detail.marker_length || 0;
                                        const totalYard = detail.total_length || 0;

                                        return (
                                            <tr key={detail.id} className={`hover:bg-zinc-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-4 py-4 text-center">
                                                    <button onClick={() => toggleSelect(detail.id)} className={`w-5 h-5 rounded flex items-center justify-center border mx-auto transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300 hover:border-indigo-400'}`}>
                                                        {isSelected && <Icon icon="solar:check-read-bold" className="w-3.5 h-3.5 text-white" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-zinc-500 font-medium">#{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-zinc-900">{detail.marker_code}</span>
                                                        <div className="flex items-center gap-2">
                                                            {detail.is_pilot_run && (
                                                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                                                    <Icon icon="solar:star-bold" className="w-2.5 h-2.5" /> Pilot
                                                                </span>
                                                            )}
                                                            {detail.type?.detail_type && (
                                                                <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[9px] font-black uppercase tracking-wider">
                                                                    {detail.type.detail_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg text-xs">
                                                        <Icon icon="solar:layers-bold-duotone" className="w-3.5 h-3.5" />
                                                        {layerQty}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-zinc-900 font-bold">{markerLengthYard.toFixed(2)} YD</span>
                                                        <span className="text-xs text-zinc-400 font-medium">{detail.marker_yard} YD {detail.marker_inch}" (A: {detail.allowance_inch}")</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-indigo-600 font-bold">{totalYard.toFixed(2)} YD</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                                        {detail.sizes?.map((sz: any) => (
                                                            <span key={sz.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-bold text-zinc-700">
                                                                <span className="text-zinc-400">{sz.size_name || 'Size'}:</span>
                                                                <span className="text-blue-600">{sz.ratio_per_size}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {detail.materials?.length > 0 ? (
                                                        <Popover.Root>
                                                            <Popover.Trigger asChild>
                                                                <button className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-2 py-1 rounded-lg text-xs transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20">
                                                                    <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />
                                                                    {detail.materials.length} Items
                                                                </button>
                                                            </Popover.Trigger>
                                                            <Popover.Portal>
                                                                <Popover.Content 
                                                                    className="z-[99999] w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                                    sideOffset={5}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100">
                                                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                            <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Materials</h4>
                                                                    </div>
                                                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                                                        {detail.materials.map((mat: any, idx: number) => {
                                                                            const typeName = mat.detail_type || 'Material';
                                                                            const colorName = mat.color_name;
                                                                            const fabricName = mat.fabric_content;
                                                                            return (
                                                                                <div key={idx} className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-100">
                                                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                                        <span className="text-xs font-bold text-zinc-900">{typeName}</span>
                                                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                                            {mat.value_per_layer} {mat.unit}/L
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex flex-col gap-1">
                                                                                        {colorName && (
                                                                                            <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                                                                                <Icon icon="solar:palette-bold-duotone" className="w-3 h-3 text-zinc-400" />
                                                                                                {colorName}
                                                                                            </span>
                                                                                        )}
                                                                                        {fabricName && (
                                                                                            <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                                                                                <Icon icon="solar:ruler-pen-bold-duotone" className="w-3 h-3 text-zinc-400" />
                                                                                                {fabricName}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </Popover.Content>
                                                            </Popover.Portal>
                                                        </Popover.Root>
                                                    ) : (
                                                        <span className="text-zinc-400 text-xs font-medium">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            onClick={() => setWarehouseDetails([detail])}
                                                            className="h-8 px-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 transition-all flex items-center gap-1.5 rounded-lg"
                                                        >
                                                            <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />
                                                            Req
                                                        </Button>
                                                        <Button onClick={() => handleEdit(detail)} variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleDelete(detail.id)} 
                                                            disabled={isDeletingId === detail.id}
                                                            variant="ghost" 
                                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-lg"
                                                        >
                                                            {isDeletingId === detail.id ? (
                                                                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                                            ) : (
                                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    filteredDetails.map((detail: any, index: number) => {
                        const isSelected = selectedDetailIds.includes(detail.id);
                        return (
                        <div key={detail.id} className={`group p-5 bg-white border ${isSelected ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'border-zinc-100 hover:border-blue-200'} rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] transition-all duration-300`}>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex items-center h-12">
                                        <button onClick={() => toggleSelect(detail.id)} className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-zinc-50 border-zinc-300 hover:border-indigo-400'}`}>
                                            {isSelected && <Icon icon="solar:check-read-bold" className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 text-blue-700 rounded-xl font-black text-lg shrink-0">
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
                                        {(() => {
                                            const markerLengthYard = detail.marker_length || 0;
                                            const totalYard = detail.total_length || 0;

                                            return (
                                                <div className="flex flex-wrap items-center gap-3 text-[13px] text-zinc-500 font-medium">
                                                    <span className="flex items-center gap-1.5"><Icon icon="solar:layers-bold-duotone" className="w-4 h-4 text-blue-400" /> {detail.layer_qty} Layers</span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span>{detail.marker_yard} YD {detail.marker_inch}"</span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span>Allowance: {detail.allowance_inch}"</span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span className="text-emerald-600 font-bold" title="Marker Length = Yard + (Inch/36) + (Allowance/36)">
                                                        Length: {markerLengthYard.toFixed(2)} YD
                                                    </span>
                                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                    <span className="text-indigo-600 font-bold" title="Total Yard = Marker Length × Layer Qty">
                                                        Total: {totalYard.toFixed(2)} YD
                                                    </span>
                                                    {detail.materials?.length > 0 && (
                                                        <>
                                                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                            <Popover.Root>
                                                                <Popover.Trigger asChild>
                                                                    <button className="flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20 rounded" title="Additional Materials">
                                                                        <Icon icon="solar:box-bold-duotone" className="w-4 h-4" />
                                                                        {detail.materials.length} Material(s)
                                                                    </button>
                                                                </Popover.Trigger>
                                                                <Popover.Portal>
                                                                    <Popover.Content 
                                                                        className="z-[99999] w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                                        sideOffset={5}
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100">
                                                                            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                                                <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />
                                                                            </div>
                                                                            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Materials</h4>
                                                                        </div>
                                                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                                                            {detail.materials.map((mat: any, idx: number) => {
                                                                                const typeName = mat.detail_type || 'Material';
                                                                                const colorName = mat.color_name;
                                                                                const fabricName = mat.fabric_content;
                                                                                return (
                                                                                    <div key={idx} className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-100">
                                                                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                                            <span className="text-xs font-bold text-zinc-900">{typeName}</span>
                                                                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                                                {mat.value_per_layer} {mat.unit}/L
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex flex-col gap-1">
                                                                                            {colorName && (
                                                                                                <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                                                                                    <Icon icon="solar:palette-bold-duotone" className="w-3 h-3 text-zinc-400" />
                                                                                                    {colorName}
                                                                                                </span>
                                                                                            )}
                                                                                            {fabricName && (
                                                                                                <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                                                                                    <Icon icon="solar:ruler-pen-bold-duotone" className="w-3 h-3 text-zinc-400" />
                                                                                                    {fabricName}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </Popover.Content>
                                                                </Popover.Portal>
                                                            </Popover.Root>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 shrink-0">
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
                                    <Button
                                        onClick={() => setWarehouseDetails([detail])}
                                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 shadow-sm transition-all flex items-center gap-2 rounded-xl"
                                    >
                                        <Icon icon="solar:box-bold-duotone" className="w-4 h-4" />
                                        Req Material
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
                        );
                    })
                )}
            </div>
            
            {renderFormModal()}
            {renderWarehouseModal()}
            {renderDeleteConfirmModal()}
            {renderToast()}
        </div>
    );
};
