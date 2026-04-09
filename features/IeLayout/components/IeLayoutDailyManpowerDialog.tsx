'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout } from '../types';

interface IeLayoutDailyManpowerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    layout: IeLayout | null;
}

export const IeLayoutDailyManpowerDialog = ({ open, onOpenChange, layout }: IeLayoutDailyManpowerDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        man_power_sewer: 0,
        man_power_matching: 0,
        man_power_qc: 0,
        man_power_others: 0
    });

    useEffect(() => {
        if (open && layout) {
            fetchHistory();
            setForm({
                date: new Date().toISOString().split('T')[0],
                man_power_sewer: layout.man_power_sewer || 0,
                man_power_matching: layout.man_power_matching || 0,
                man_power_qc: layout.man_power_qc || 0,
                man_power_others: layout.man_power_others || 0
            });
        }
    }, [open, layout]);

    const fetchHistory = async () => {
        if (!layout) return;
        try {
            const data = await IeLayoutService.getDailyManpower(layout.id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleSave = async () => {
        if (!layout) return;
        setIsLoading(true);
        try {
            await IeLayoutService.saveDailyManpower({
                ...form,
                ie_layout_id: layout.id
            });
            await fetchHistory();
            alert('Daily manpower recorded successfully.');
        } catch (error) {
            console.error('Failed to save daily manpower:', error);
            alert('Error recording daily manpower.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-[3rem] shadow-3xl z-[101] overflow-hidden focus:outline-none animate-in zoom-in-95 fade-in duration-300">
                    <div className="p-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">Daily Workforce Tracking</h2>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{layout?.name}</p>
                            </div>
                            <Dialog.Close className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all">
                                <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
                            </Dialog.Close>
                        </div>

                        <div className="space-y-8">
                            {/* Input Seciton */}
                            <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Observation Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-white border border-zinc-200 h-14 rounded-2xl px-5 font-bold text-sm text-zinc-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                        value={form.date}
                                        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Sewer MP</label>
                                        <input
                                            type="number" step="0.5"
                                            className="w-full bg-white border border-zinc-200 h-12 rounded-xl px-4 font-bold text-sm text-zinc-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            value={form.man_power_sewer}
                                            onChange={(e) => setForm(prev => ({ ...prev, man_power_sewer: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Matching MP</label>
                                        <input
                                            type="number" step="0.5"
                                            className="w-full bg-white border border-zinc-200 h-12 rounded-xl px-4 font-bold text-sm text-zinc-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            value={form.man_power_matching}
                                            onChange={(e) => setForm(prev => ({ ...prev, man_power_matching: Number(e.target.value) }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">QC MP</label>
                                        <input
                                            type="number" step="0.5"
                                            className="w-full bg-white border border-zinc-200 h-12 rounded-xl px-4 font-bold text-sm text-zinc-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            value={form.man_power_qc}
                                            onChange={(e) => setForm(prev => ({ ...prev, man_power_qc: Number(e.target.value) }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Others MP</label>
                                        <input
                                            type="number" step="0.5"
                                            className="w-full bg-white border border-zinc-200 h-12 rounded-xl px-4 font-bold text-sm text-zinc-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            value={form.man_power_others}
                                            onChange={(e) => setForm(prev => ({ ...prev, man_power_others: Number(e.target.value) }))}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-zinc-900 hover:bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isLoading ? <Icon icon="solar:refresh-line-duotone" className="w-5 h-5 animate-spin" /> : <Icon icon="solar:calendar-date-bold-duotone" className="w-5 h-5" />}
                                    Record Daily Count
                                </Button>
                            </div>

                            {/* History Section */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Recent Records
                                </h3>

                                <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
                                    {history.map((record) => (
                                        <div key={record.id} className="bg-white border border-zinc-100 p-4 rounded-2xl flex items-center justify-between hover:border-blue-100 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                                    <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-zinc-900 uppercase">{new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Total Workers: <span className="text-blue-500">{record.man_power_sewer + record.man_power_matching + record.man_power_qc + record.man_power_others}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex flex-col items-end opacity-50">
                                                    <span className="text-[8px] font-bold uppercase text-zinc-400">S:{record.man_power_sewer} M:{record.man_power_matching}</span>
                                                    <span className="text-[8px] font-bold uppercase text-zinc-400">Q:{record.man_power_qc} O:{record.man_power_others}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length === 0 && (
                                        <div className="py-10 text-center text-zinc-300">
                                            <p className="text-[10px] font-black uppercase tracking-widest italic opacity-50">No historical data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </Dialog.Root>
    );
};
