'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { ReferenceService } from '@/features/Reference/services/ReferenceService';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PackingService } from '../services/PackingService';

export default function PackingFormPage() {
    const router = useRouter();
    const [lots, setLots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Warehouse', icon: 'solar:box-bold-duotone' },
        { label: 'Packing', href: '/admin/packing', icon: 'solar:box-bold-duotone' },
        { label: 'New Packing Log', icon: 'solar:add-circle-bold-duotone' },
    ];

    // Form State
    const [formData, setFormData] = useState({
        packing_date: new Date().toISOString().split('T')[0],
        entry_mode: 'output', // Default to simplified for Packing
        remarks: '',
        items: [
            {
                lot_id: '',
                color: '',
                sizes: [
                    { size_name: 'S', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                    { size_name: 'M', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                    { size_name: 'L', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                    { size_name: 'XL', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                ]
            }
        ]
    });

    const [lotDetails, setLotDetails] = useState<Record<number, any[]>>({});

    useEffect(() => {
        // Fetch Lots
        ReferenceService.getLotList().then(res => {
            if (res && res.status === 'success') {
                const sorted = res.data
                    .map((l: any) => ({
                        id: l.id,
                        label: (l.lot_code || '').replace(/^0+/, ''),
                        lot_code: l.lot_code || ''
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
                setLots(sorted);
            }
        });
    }, []);

    const fetchLotDetails = async (lotId: string, itemIdx: number) => {
        const lot = lots.find(l => String(l.id) === String(lotId));
        if (!lot) return;

        try {
            const resp = await fetch(`http://cutting.glaindonesia.lan/api/summary-by-gl?gl_number=${lot.lot_code.replace(/^0+/, '')}`);
            const json = await resp.json();

            if (json.status === 200 && json.data.summary_by_color) {
                // Filter only 'body' types as per user request
                const bodyColors = json.data.summary_by_color.filter((c: any) =>
                    String(c.type || '').toLowerCase() === 'body'
                );

                setLotDetails(prev => ({
                    ...prev,
                    [itemIdx]: bodyColors
                }));

                if (bodyColors.length === 1) {
                    const colorData = bodyColors[0];
                    updateItemColor(itemIdx, colorData.color, colorData.size_breakdown);
                }
            }
        } catch (error) {
            console.error('Failed to fetch cutting details:', error);
        }
    };

    const updateItemColor = async (itemIdx: number, color: string, sizeBreakdown?: any[]) => {
        const item = formData.items[itemIdx];
        const lotId = item.lot_id;

        let recordedSummary: Record<string, any> = {};
        if (lotId && color) {
            try {
                const res = await PackingService.getSummary(lotId, color);
                if (res && res.status === 'success') {
                    recordedSummary = res.data;
                }
            } catch (err) {
                console.error('Failed to fetch summary:', err);
            }
        }

        const newItems = [...formData.items];
        const sizes = sizeBreakdown ? sizeBreakdown.map(s => ({
            size_name: s.size,
            order_mi: parseInt(s.total_order || s.order_qty) || 0,
            cut_qty: parseInt(s.cut_qty) || 0,
            recorded_input: Number(recordedSummary[s.size]?.total_input || 0),
            recorded_output: Number(recordedSummary[s.size]?.total_output || 0),
            qty_input: 0,
            qty_output: 0
        })) : newItems[itemIdx].sizes.map(s => ({
            ...s,
            recorded_input: Number(recordedSummary[s.size_name]?.total_input || 0),
            recorded_output: Number(recordedSummary[s.size_name]?.total_output || 0)
        }));

        if (formData.entry_mode === 'output') {
            const totalEntryExists = sizes.some(s => s.size_name === 'TOTAL');
            if (!totalEntryExists) {
                sizes.push({
                    size_name: 'TOTAL',
                    order_mi: sizes.reduce((sum, s) => sum + (s.order_mi || 0), 0),
                    cut_qty: sizes.reduce((sum, s) => sum + (s.cut_qty || 0), 0),
                    recorded_input: sizes.reduce((sum, s) => sum + (s.recorded_input || 0), 0),
                    recorded_output: sizes.reduce((sum, s) => sum + (s.recorded_output || 0), 0),
                    qty_input: 0,
                    qty_output: 0
                });
            }
        }

        newItems[itemIdx] = {
            ...newItems[itemIdx],
            color: color,
            sizes: sizes
        };
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                {
                    lot_id: '',
                    color: '',
                    sizes: [
                        { size_name: 'S', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                        { size_name: 'M', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                        { size_name: 'L', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                        { size_name: 'XL', qty_input: 0, qty_output: 0, order_mi: 0, cut_qty: 0, recorded_input: 0, recorded_output: 0 },
                    ]
                }
            ]
        });
    };

    const handleSave = async () => {
        if (!formData.packing_date) {
            alert('Please fill in Date.');
            return;
        }

        setIsLoading(true);
        try {
            const cleanedItems = formData.items.map(item => {
                if (formData.entry_mode === 'output') {
                    const totalEntry = item.sizes.find(s => s.size_name === 'TOTAL');
                    return { ...item, sizes: totalEntry ? [totalEntry] : [] };
                }
                return { ...item, sizes: item.sizes.filter(s => s.size_name !== 'TOTAL') };
            });

            await PackingService.create({ ...formData, items: cleanedItems });
            router.push('/admin/packing');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save packing log.');
        } finally {
            setIsLoading(false);
        }
    };

    const grandTotalOutput = formData.items.reduce((sum, item) => {
        return sum + item.sizes.reduce((iSum, s) => iSum + (s.qty_output || 0), 0);
    }, 0);

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Create Packing Log"
                subtitle="Warehouse Entry"
                description="Record daily finished goods packing quantities."
                action={
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/packing')}
                        className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all font-black text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
                    >
                        <Icon icon="solar:alt-arrow-left-bold-duotone" className="w-5 h-5" />
                        <span>Back</span>
                    </Button>
                }
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden p-4 md:p-6 w-full mb-20 relative max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 items-end">
                    <div className="space-y-1.5 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Packing Date</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                <Icon icon="solar:calendar-bold-duotone" className="w-5 h-5" />
                            </div>
                            <input
                                type="date"
                                className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all font-black text-[13px] tracking-tight"
                                value={formData.packing_date}
                                onChange={(e) => setFormData({ ...formData, packing_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2 space-y-1.5 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Packing Remarks / Notes</label>
                        <input
                            type="text"
                            placeholder="e.g. Export batch #02, Rush order..."
                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-black text-[13px]"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="bg-zinc-100 p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-200">
                            <button
                                onClick={() => setFormData({ ...formData, entry_mode: 'output' })}
                                className={cn(
                                    "px-6 h-10 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    formData.entry_mode === 'output' ? "bg-emerald-900 text-white shadow-xl" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:box-bold-duotone" className="w-4 h-4" />
                                <span>Output Only</span>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, entry_mode: 'per-size' })}
                                className={cn(
                                    "px-6 h-10 rounded-xl flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    formData.entry_mode === 'per-size' ? "bg-emerald-900 text-white shadow-xl" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:ruler-bold-duotone" className="w-4 h-4" />
                                <span>Per Size</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-16">
                    {formData.items.map((item, iIdx) => {
                        const sizesToShow = formData.entry_mode === 'output'
                            ? item.sizes.filter(s => s.size_name === 'TOTAL')
                            : item.sizes.filter(s => s.size_name !== 'TOTAL');

                        const totalInput = sizesToShow.reduce((sum, s) => sum + (s.qty_input || 0), 0);
                        const totalOutput = sizesToShow.reduce((sum, s) => sum + (s.qty_output || 0), 0);
                        const totalOrder = sizesToShow.reduce((sum, s) => sum + (s.order_mi || 0), 0);
                        const totalCut = sizesToShow.reduce((sum, s) => sum + (s.cut_qty || 0), 0);
                        const totalRecordedOutput = sizesToShow.reduce((sum, s) => sum + (Number(s.recorded_output) || 0), 0);

                        return (
                            <div key={iIdx} className="group relative p-5 md:p-6 bg-zinc-50/30 rounded-[3rem] border border-zinc-100 hover:border-emerald-100 hover:bg-white transition-all duration-700">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[1.2rem] bg-emerald-950 text-white flex items-center justify-center font-black text-sm shadow-xl">
                                            {iIdx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900">Garment Product Reference</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Warehouse breakdown</p>
                                        </div>
                                    </div>
                                    {formData.items.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                const newItems = formData.items.filter((_, idx) => idx !== iIdx);
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                            className="text-red-500 hover:bg-red-50 w-12 h-12 rounded-2xl transition-all"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-6 h-6" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 items-end">
                                    <Select
                                        label="GL Number"
                                        placeholder="Search GL Code..."
                                        options={lots}
                                        value={item.lot_id}
                                        onChange={async (val) => {
                                            const newItems = [...formData.items];
                                            newItems[iIdx].lot_id = String(val);
                                            newItems[iIdx].color = '';
                                            newItems[iIdx].sizes = [];
                                            setFormData({ ...formData, items: newItems });
                                            fetchLotDetails(String(val), iIdx);
                                        }}
                                    />
                                    {item.lot_id && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color Variant</label>
                                            {lotDetails[iIdx] ? (
                                                <Select
                                                    placeholder="Choose Color..."
                                                    options={lotDetails[iIdx].map(c => ({ id: c.color, label: c.color }))}
                                                    value={item.color}
                                                    onChange={(val) => {
                                                        const colorData = lotDetails[iIdx].find(c => c.color === val);
                                                        updateItemColor(iIdx, String(val), colorData?.size_breakdown);
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full bg-white border border-zinc-100 h-14 rounded-2xl px-6 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all font-black text-sm tracking-tight"
                                                    placeholder="e.g. Navy Blue"
                                                    value={item.color}
                                                    onChange={(e) => updateItemColor(iIdx, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {item.lot_id && item.sizes.length > 0 && (
                                    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-1000">
                                        <div className="overflow-x-auto no-scrollbar">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-emerald-950 text-white">
                                                        <th className="px-4 py-5 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10 w-36">
                                                            Data Metrics
                                                        </th>
                                                        {sizesToShow.map((s, idx) => (
                                                            <th key={idx} className="px-3 py-5 text-center text-[10px] font-black uppercase tracking-widest min-w-[70px]">
                                                                {s.size_name}
                                                            </th>
                                                        ))}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <th className="px-3 py-5 text-center text-[10px] font-black uppercase tracking-widest min-w-[80px] bg-emerald-600">
                                                                TOTAL
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-50">
                                                    {/* ORDER MI ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-6 py-4 bg-zinc-50 border-r border-zinc-100">
                                                            <span className="text-[10px] font-black text-zinc-900 uppercase">Order MI</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => (
                                                            <td key={idx} className="px-6 py-4 text-center font-black text-zinc-900 bg-zinc-50/50">
                                                                {s.order_mi || 0}
                                                            </td>
                                                        ))}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-6 py-4 text-center font-black text-zinc-900 bg-emerald-50/50">
                                                                {totalOrder}
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {/* OUTPUT ROW (BOX) */}
                                                    <tr className="group/row">
                                                        <td className="px-6 py-5 bg-zinc-50 border-r border-zinc-100 relative overflow-hidden">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                                            <span className="text-[10px] font-black text-emerald-700 uppercase">Output (BOX)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const sIdx = item.sizes.findIndex(sz => sz.size_name === s.size_name);
                                                            return (
                                                                <td key={idx} className="px-4 py-5">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-center font-black text-sm focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/30 transition-all outline-none"
                                                                        value={s.qty_output || ''}
                                                                        placeholder="0"
                                                                        onChange={(e) => {
                                                                            const newItems = [...formData.items];
                                                                            newItems[iIdx].sizes[sIdx].qty_output = parseInt(e.target.value) || 0;
                                                                            setFormData({ ...formData, items: newItems });
                                                                        }}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-6 py-5 text-center font-black text-emerald-700 text-[16px] bg-emerald-50">
                                                                {totalOutput}
                                                            </td>
                                                        )}
                                                    </tr>
                                                    {/* INPUT ROW (PACK) */}
                                                    <tr className="group/row">
                                                        <td className="px-6 py-5 bg-zinc-50 border-r border-zinc-100">
                                                            <span className="text-[10px] font-black text-blue-700 uppercase">Input (PACK)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const sIdx = item.sizes.findIndex(sz => sz.size_name === s.size_name);
                                                            return (
                                                                <td key={idx} className="px-4 py-5">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-2xl text-center font-black text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/30 transition-all outline-none"
                                                                        value={s.qty_input || ''}
                                                                        placeholder="0"
                                                                        onChange={(e) => {
                                                                            const newItems = [...formData.items];
                                                                            newItems[iIdx].sizes[sIdx].qty_input = parseInt(e.target.value) || 0;
                                                                            setFormData({ ...formData, items: newItems });
                                                                        }}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-6 py-5 text-center font-black text-blue-700 text-[16px] bg-blue-50">
                                                                {totalInput}
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {/* BALANCE ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-6 py-4 bg-zinc-50 border-r border-zinc-100 relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                                                            <span className="text-[10px] font-black text-orange-600 uppercase">Balance (Cut)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const currentTotalOut = (Number(s.recorded_output) || 0) + (Number(s.qty_output) || 0);
                                                            const balance = (Number(s.cut_qty) || 0) - currentTotalOut;
                                                            return (
                                                                <td key={idx} className={cn(
                                                                    "px-6 py-4 text-center font-black text-sm",
                                                                    balance < 0 ? "text-red-500 bg-red-50" : "text-orange-600 bg-orange-50/20"
                                                                )}>
                                                                    {balance}
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className={cn(
                                                                "px-6 py-4 text-center font-black text-sm",
                                                                (totalCut - (totalRecordedOutput + totalOutput)) < 0 ? "text-red-500 bg-red-50" : "text-orange-600 bg-orange-50/50"
                                                            )}>
                                                                {totalCut - (totalRecordedOutput + totalOutput)}
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {/* PROGRESS ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-6 py-4 bg-zinc-50 border-r border-zinc-100">
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase">Progress (%)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const currentTotalOut = (Number(s.recorded_output) || 0) + (Number(s.qty_output) || 0);
                                                            const progress = s.cut_qty > 0 ? (currentTotalOut / s.cut_qty) * 100 : 0;
                                                            return (
                                                                <td key={idx} className="px-4 py-4">
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={cn(
                                                                            "text-[10px] font-black mb-1",
                                                                            progress >= 100 ? "text-emerald-600" : "text-zinc-500"
                                                                        )}>
                                                                            {progress.toFixed(1)}%
                                                                        </span>
                                                                        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                                                                            <div
                                                                                className={cn("h-full transition-all duration-500", progress >= 100 ? "bg-emerald-500" : "bg-emerald-600/40")}
                                                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-4 py-4 bg-zinc-100/30">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-[10px] font-black text-zinc-900 mb-1">
                                                                        {totalCut > 0 ? ((totalRecordedOutput + totalOutput) / totalCut * 100).toFixed(1) : 0}%
                                                                    </span>
                                                                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-emerald-950 transition-all duration-500"
                                                                            style={{ width: `${Math.min(totalCut > 0 ? (totalRecordedOutput + totalOutput) / totalCut * 100 : 0, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col md:flex-row gap-5 items-center">
                        <button
                            onClick={addItem}
                            className="flex-1 w-full py-10 border-2 border-dashed border-zinc-100 rounded-[2.5rem] text-zinc-400 hover:border-emerald-200 hover:text-emerald-500 transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                            <Icon icon="solar:add-square-bold-duotone" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Add Another Product</span>
                        </button>

                        {grandTotalOutput > 0 && (
                            <div className="shrink-0 bg-emerald-900 text-white px-8 py-6 rounded-[2.5rem] shadow-xl shadow-emerald-950/20 border border-emerald-800/30 flex flex-col items-center justify-center min-w-[180px] animate-in zoom-in duration-500">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Finished Goods</span>
                                <span className="text-2xl font-black tracking-tight">{grandTotalOutput.toLocaleString()} <span className="text-xs opacity-40">PCS</span></span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="md:w-80 h-auto py-10 bg-emerald-950 hover:bg-emerald-900 text-white rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-3"
                    >
                        <Icon icon={isLoading ? "solar:refresh-line-duotone" : "solar:check-circle-bold-duotone"} className={cn("w-8 h-8", isLoading && "animate-spin")} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                            {isLoading ? 'Saving...' : 'Finalize Packing Log'}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
