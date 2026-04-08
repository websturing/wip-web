'use client';

import { Button } from '@/app/components/ui/Button';
import { Column, DataTable } from '@/app/components/ui/DataTable';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { useState } from 'react';
import { useLines } from '../hooks/useLines';
import { LineService } from '../services/LineService';

export const Lines = () => {
    const { data: lines, isLoading, refresh } = useLines();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editLine, setEditLine] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', location: '' });

    const columns: Column<any>[] = [
        {
            header: '#',
            accessorKey: 'index',
            className: 'w-10 text-zinc-400 font-bold',
            cell: (_, idx) => idx + 1
        },
        {
            header: 'Line ID',
            accessorKey: 'id',
            className: 'w-[120px]',
            cell: (item) => (
                <span className="font-mono text-[11px] font-bold text-zinc-400">#LINE-{item.id}</span>
            ),
            sortable: true
        },
        {
            header: 'Section Name',
            accessorKey: 'name',
            filterable: false, // Removed filter for Section Name as requested
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                        {item.name.charAt(0)}
                    </div>
                    <span className="font-bold text-zinc-900">{item.name}</span>
                </div>
            )
        },
        {
            header: 'Location',
            accessorKey: 'location',
            filterable: true,
            filterType: 'select',
            cell: (item) => (
                <span className="text-zinc-500 text-sm font-medium">{item.location || 'N/A'}</span>
            )
        },
        {
            header: 'Last Update',
            accessorKey: 'updated_at',
            sortable: true,
            cell: (item) => (
                <span className="text-zinc-400 text-[10px] font-bold uppercase">
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                </span>
            )
        },
        {
            header: '',
            accessorKey: 'actions',
            className: 'text-right',
            cell: (item) => (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white border-transparent border hover:border-zinc-100 rounded-xl transition-all shadow-none hover:shadow-sm"
                    >
                        <Icon icon="solar:pen-bold-duotone" className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ];

    const handleOpenModal = (line: any = null) => {
        if (line) {
            setEditLine(line);
            setFormData({ name: line.name, location: line.location || '' });
        } else {
            setEditLine(null);
            setFormData({ name: '', location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editLine) {
                await LineService.update(editLine.id, formData);
            } else {
                await LineService.create(formData);
            }
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this production line?')) {
            try {
                await LineService.delete(id);
                refresh();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-zinc-900/5 p-3 rounded-2xl text-zinc-900">
                        <Icon icon="solar:tablet-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Production Lines</h2>
                        <p className="text-zinc-500 text-xs font-medium">Manage manufacturing areas and assembly sections</p>
                    </div>
                </div>

                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-12 flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <Icon icon="solar:add-square-bold-duotone" className="w-5 h-5" />
                    <span>Create Line</span>
                </Button>
            </div>

            <DataTable
                data={lines || []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search lines..."
            />

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[2rem]">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <Icon icon="solar:add-square-bold-duotone" className="w-6 h-6 text-blue-600" />
                            {editLine ? 'Edit Section' : 'Create New Section'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 pt-4 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Section Name</label>
                            <input
                                className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                placeholder="e.g. Line A1"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Location Details</label>
                            <textarea
                                className="w-full bg-zinc-50 border border-zinc-100 h-32 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-sm resize-none"
                                placeholder="e.g. Building 2, Floor 3, Area B"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-8 font-bold text-zinc-500">Cancel</Button>
                        <Button
                            onClick={handleSave}
                            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 px-10 font-bold shadow-lg ml-2 active:scale-95 transition-all"
                        >
                            {editLine ? 'Update Section' : 'Add Section'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
