'use client';

import { Button } from '@/app/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { useEffect, useState } from 'react';
import { useProduction } from '../hooks/useProduction';
import { ProductionService } from '../services/ProductionService';

export const Production = () => {
    const { data: productions, isLoading, refresh } = useProduction();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lines, setLines] = useState<any[]>([]);

    useEffect(() => {
        ProductionService.getLines().then(res => {
            if (res && res.status === 'success') {
                setLines(res.data || []);
            }
        }).catch(err => {
            console.error('Lines fetch error:', err);
            setLines([]);
        });
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        production_date: new Date().toISOString().split('T')[0],
        line_id: '',
        items: [
            {
                gl_number: '',
                color: '',
                sizes: [
                    { size_name: 'S', qty_input: 0, qty_output: 0 },
                    { size_name: 'M', qty_input: 0, qty_output: 0 },
                    { size_name: 'L', qty_input: 0, qty_output: 0 },
                    { size_name: 'XL', qty_input: 0, qty_output: 0 },
                ]
            }
        ]
    });

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    gl_number: '',
                    color: '',
                    sizes: [
                        { size_name: 'S', qty_input: 0, qty_output: 0 },
                        { size_name: 'M', qty_input: 0, qty_output: 0 },
                        { size_name: 'L', qty_input: 0, qty_output: 0 },
                        { size_name: 'XL', qty_input: 0, qty_output: 0 },
                    ]
                }
            ]
        });
    };

    const handleSave = async () => {
        try {
            await ProductionService.create(formData);
            setIsModalOpen(false);
            refresh();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    if (isLoading) return (
        <div className="p-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600">
                        <Icon icon="solar:chart-2-bold-duotone" className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Production Log</h2>
                        <p className="text-zinc-500 text-xs font-medium">Monitoring daily assembly progress</p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-12 flex items-center gap-2 transition-all shadow-lg active:scale-95"
                >
                    <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
                    <span>Create Production Log</span>
                </Button>
            </div>

            {/* Production List (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(productions || []).length === 0 ? (
                    <div className="col-span-full py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400">
                        <Icon icon="solar:box-minimalistic-bold-duotone" className="w-12 h-12 opacity-20 mb-4" />
                        <p className="text-sm font-medium">No production logs found for today.</p>
                        <p className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-50">Start by creating a new log</p>
                    </div>
                ) : (
                    (productions || []).map((p: any, idx: number) => (
                        <div key={idx} className="group bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-100">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{p.line?.name || 'Line'}</span>
                                </div>
                                <span className="text-zinc-400 text-[10px] font-bold">{p.production_date}</span>
                            </div>

                            <div className="space-y-4">
                                {(p.items || []).map((item: any, iIdx: number) => (
                                    <div key={iIdx} className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-sm text-zinc-900">{item.gl_number}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{item.color}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-tighter">
                                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                                <span className="text-zinc-400">Total Input</span>
                                                <span className="text-zinc-900">{(item.sizes || []).reduce((acc: number, s: any) => acc + (s.qty_input || 0), 0)}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-100">
                                                <span className="text-zinc-400">Total Output</span>
                                                <span className="text-blue-600">{(item.sizes || []).reduce((acc: number, s: any) => acc + (s.qty_output || 0), 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-zinc-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Entry By</span>
                                    <span className="text-[11px] font-bold text-zinc-700">{p.creator?.name || 'Administrator'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all">
                                        <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this log?')) {
                                                await ProductionService.delete(p.id);
                                                refresh();
                                            }
                                        }}
                                        className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Creation */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-8 bg-zinc-900 text-white">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Icon icon="solar:add-circle-bold-duotone" className="w-7 h-7 text-blue-400" />
                            New Production Entry
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 max-h-[70vh] overflow-y-auto hover-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Production Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                    value={formData.production_date}
                                    onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Select Line</label>
                                <select
                                    className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                    value={formData.line_id}
                                    onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
                                >
                                    <option value="">Choose Line...</option>
                                    {(lines || []).length > 0 && (lines || []).map((line: any) => (
                                        <option key={line.id} value={line.id}>{line.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {formData.items.map((item, iIdx) => (
                                <div key={iIdx} className="relative p-8 bg-zinc-50/50 rounded-[2rem] border border-zinc-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Product #{iIdx + 1}</h3>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                const newItems = formData.items.filter((_, idx) => idx !== iIdx);
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                            className="text-red-500 hover:bg-red-50 p-2 h-auto rounded-lg"
                                        >
                                            <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">GL Number</label>
                                            <input
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none font-bold text-sm"
                                                placeholder="e.g. GL-001"
                                                value={item.gl_number}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[iIdx].gl_number = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">Color</label>
                                            <input
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none font-bold text-sm"
                                                placeholder="e.g. Navy Blue"
                                                value={item.color}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[iIdx].color = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                                        <div className="grid grid-cols-4 gap-4 mb-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                                            <div className="col-span-1">Size</div>
                                            <div className="col-span-1">Input Qty</div>
                                            <div className="col-span-1">Output Qty</div>
                                            <div className="col-span-1 text-right">Balance</div>
                                        </div>
                                        <div className="space-y-3">
                                            {item.sizes.map((size, sIdx) => (
                                                <div key={sIdx} className="grid grid-cols-4 gap-4 items-center">
                                                    <div className="font-bold text-zinc-900">{size.size_name}</div>
                                                    <input
                                                        type="number"
                                                        className="bg-zinc-50 border border-zinc-100 h-10 rounded-lg text-center font-bold text-xs focus:ring-1 focus:ring-blue-500/30 transition-all outline-none"
                                                        value={size.qty_input}
                                                        onChange={(e) => {
                                                            const newItems = [...formData.items];
                                                            newItems[iIdx].sizes[sIdx].qty_input = parseInt(e.target.value) || 0;
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                    />
                                                    <input
                                                        type="number"
                                                        className="bg-zinc-50 border border-zinc-100 h-10 rounded-lg text-center font-bold text-xs focus:ring-1 focus:ring-blue-500/30 transition-all outline-none"
                                                        value={size.qty_output}
                                                        onChange={(e) => {
                                                            const newItems = [...formData.items];
                                                            newItems[iIdx].sizes[sIdx].qty_output = parseInt(e.target.value) || 0;
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                    />
                                                    <div className="text-right text-xs font-bold text-zinc-400">
                                                        {(size.qty_input || 0) - (size.qty_output || 0)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addItem}
                            className="w-full mt-10 py-6 border-2 border-dashed border-zinc-100 rounded-[2rem] text-zinc-400 hover:border-blue-200 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <Icon icon="solar:add-square-bold-duotone" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Another Product Reference</span>
                        </button>
                    </div>

                    <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 px-8 font-bold text-zinc-500">Cancel</Button>
                        <Button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-10 font-bold shadow-lg shadow-blue-500/20 ml-4 active:scale-95 transition-all"
                        >
                            Submit Production Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
