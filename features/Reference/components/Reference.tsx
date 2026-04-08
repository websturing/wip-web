'use client';

import { Button } from '@/app/components/ui/Button';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import React, { useMemo, useRef, useState } from 'react';
import { useReference } from '../hooks/useReference';
import { ReferenceService } from '../services/ReferenceService';

export const Reference = () => {
    const { lots, lastImport, isLoading, refresh, currentPage, total, perPage, setPage } = useReference();
    const [isImporting, setIsImporting] = useState(false);
    const [importSummary, setImportSummary] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format utility: get last 5 characters
    const formatGl = (gl: string) => {
        if (!gl) return 'N/A';
        return gl.length > 5 ? gl.slice(-5) : gl;
    };

    // Flatten data for easier filtering and display
    const processedData = useMemo(() => {
        return lots.map(lot => {
            const shortGl = formatGl(lot.gl_group?.gl_number);
            return {
                ...lot,
                customer_name: lot.gl_group?.customer?.name || 'Unknown',
                display_gl: shortGl,
                display_lot_code: `${shortGl}-${lot.lot_number}`,
                status_text: lot.is_cancelled ? 'Cancelled' : 'Active'
            };
        });
    }, [lots]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await ReferenceService.deleteLot(deleteId);
            refresh();
            setDeleteId(null);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<any>[] = [
        {
            header: '#',
            accessorKey: 'index',
            className: 'w-10 text-zinc-400 font-bold',
            cell: (_, idx) => idx + 1
        },
        {
            header: 'Customer',
            accessorKey: 'customer_name',
            filterable: true,
            filterType: 'select',
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                        {item.customer_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-zinc-900 leading-none">{item.customer_name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-tighter">
                            {item.gl_group?.customer?.country || 'N/A'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'GL Group',
            accessorKey: 'display_gl',
            filterable: false,
            sortable: true,
            cell: (item) => (
                <span className="font-bold text-zinc-900">{item.display_gl}</span>
            )
        },
        {
            header: 'Lot Code',
            accessorKey: 'display_lot_code',
            filterable: false,
            sortable: true,
            cell: (item) => (
                <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg font-mono text-[11px] font-bold border border-zinc-200">
                    {item.display_lot_code}
                </span>
            )
        },
        {
            header: 'Style No',
            accessorKey: 'style_no',
            filterable: true,
            sortable: true,
            cell: (item) => <span className="font-bold text-zinc-900">{item.style_no || '-'}</span>
        },
        {
            header: 'Brand',
            accessorKey: 'brand',
            filterable: true,
            sortable: true,
            cell: (item) => <span className="font-bold text-zinc-900">{item.brand || '-'}</span>
        },
        {
            header: 'SAM',
            accessorKey: 'sam',
            sortable: true,
            cell: (item) => <span className="font-bold text-zinc-900">{item.sam ? Number(item.sam).toFixed(3) : '-'}</span>
        },
        {
            header: 'Order Qty',
            accessorKey: 'gmt_qty',
            filterable: false,
            sortable: true,
            cell: (item) => (
                <span className="font-bold text-zinc-900">
                    {item.gmt_qty ? item.gmt_qty.toLocaleString() : '-'}
                </span>
            )
        },
        {
            header: 'Delivery',
            accessorKey: 'delivery_date',
            sortable: true,
            cell: (item) => (
                <span className="text-xs font-bold text-zinc-900">
                    {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </span>
            )
        },
        {
            header: 'Order Date',
            accessorKey: 'order_date',
            sortable: true,
            cell: (item) => (
                <span className="text-xs font-bold text-zinc-900">
                    {item.order_date ? new Date(item.order_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status_text',
            filterable: true,
            filterType: 'select',
            cell: (item) => (
                item.is_cancelled ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Cancelled</span>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                )
            )
        },
        {
            header: 'Last Update',
            accessorKey: 'updated_at',
            sortable: true,
            cell: (item) => (
                <div className="flex flex-col">
                    <span className="text-zinc-900 text-xs font-bold leading-none">
                        {new Date(item.updated_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-zinc-400 text-[10px] font-medium mt-1 uppercase">
                        {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            header: '',
            accessorKey: 'actions',
            className: 'text-right',
            cell: (item) => (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportSummary(null);
        try {
            const result = await ReferenceService.importExcel(file);
            setImportSummary(result.summary);
            refresh();
        } catch (error) {
            console.error('Import failed:', error);
            alert('Import process failed. Please check your file format.');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900 p-3 rounded-2xl text-white shadow-xl shadow-zinc-200">
                        <Icon icon="solar:database-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Garment Lot Reference</h2>
                            {lastImport && (
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-500 rounded-full border border-zinc-200">
                                    <Icon icon="solar:history-bold-duotone" className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                        Last Synced: {new Date(lastImport).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] opacity-60 mt-1">Global Synchronization Hub</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".xlsx, .xls, .csv"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {isImporting ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Icon icon="solar:file-send-bold-duotone" className="w-5 h-5" />
                        )}
                        <span>{isImporting ? 'Importing...' : 'Bulk Excel Import'}</span>
                    </Button>
                </div>
            </div>

            {importSummary && (
                <div className="mb-8 p-6 bg-emerald-50/50 border border-emerald-100 rounded-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                            <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5" />
                            <span className="text-sm font-bold">Import Finished Successfully</span>
                        </div>
                        <button onClick={() => setImportSummary(null)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                            <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100/50">
                            <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Total Rows</p>
                            <p className="text-lg font-black text-emerald-600">{importSummary.total}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100/50">
                            <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">New Records</p>
                            <p className="text-lg font-black text-emerald-600">{importSummary.inserted}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100/50">
                            <p className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Updated</p>
                            <p className="text-lg font-black text-emerald-600">{importSummary.updated}</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-emerald-100/50">
                            <p className="text-[9px] font-black uppercase text-red-400 tracking-widest">Skipped</p>
                            <p className="text-lg font-black text-red-600">{importSummary.skipped}</p>
                        </div>
                    </div>
                    {importSummary.errors?.length > 0 && (
                        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-[10px] font-bold text-red-500 overflow-y-auto max-h-32">
                            {importSummary.errors.map((err: string, i: number) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <DataTable
                data={processedData}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search lots..."
                total={total}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setPage}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="max-w-md bg-zinc-950 border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-6 h-6" />
                            </div>
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 mt-4 h-full">
                            Are you sure you want to delete this lot? This action cannot be undone and may affect related production logs.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8 shadow-lg shadow-red-900/20"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
