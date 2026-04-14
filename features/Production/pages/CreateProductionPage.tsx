'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { DatePicker } from '@/app/components/ui/DatePicker';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import {
    Toast,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/app/components/ui/Toast';
import { ReferenceService } from '@/features/Reference/services/ReferenceService';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductionService } from '../services/ProductionService';

export default function CreateProductionPage({ id }: { id?: string }) {
    return (
        <ToastProvider swipeDirection="up" duration={5000}>
            <CreateProductionForm id={id} />
            <ToastViewport />
        </ToastProvider>
    );
}

function CreateProductionForm({ id }: { id?: string }) {
    const router = useRouter();
    const isEdit = !!id;
    const [lines, setLines] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; title: string, message: string; variant?: 'success' | 'destructive' }>({
        open: false,
        title: '',
        message: '',
        variant: 'success'
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const showToast = (title: string, message: string, variant: 'success' | 'destructive' = 'success') => {
        setToast({ open: true, title, message, variant });
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Sewing', icon: 'solar:t-shirt-bold-duotone' },
        { label: 'Production', href: '/admin/production', icon: 'solar:chart-2-bold-duotone' },
        { label: 'Create New Log', icon: 'solar:add-circle-bold-duotone' },
    ];

    // Form State
    const [formData, setFormData] = useState({
        production_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        line_id: '',
        entry_mode: 'per-size', // Default to detailed per-size entry for Sewing
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
        const init = async () => {
            // Fetch Lines
            const linesRes = await ProductionService.getLines();
            if (linesRes?.status === 'success') {
                setLines(linesRes.data
                    .map((l: any) => ({ id: l.id, label: l.name }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })));
            }

            // Fetch Lots
            const lotsRes = await ReferenceService.getLotList();
            if (lotsRes?.status === 'success') {
                setLots(lotsRes.data
                    .map((l: any) => ({
                        id: l.id,
                        label: (l.lot_code || '').replace(/^0+/, ''),
                        lot_code: l.lot_code || ''
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' })));
            }

            // If Edit Mode, fetch record
            if (id) {
                const res = await ProductionService.getById(id);
                if (res?.status === 'success') {
                    const p = res.data;

                    // Map items to form structure
                    const mappedItems = p.items.map((item: any) => ({
                        id: item.id, // Keep ID for potential server-side mapping
                        lot_id: String(item.lot_id),
                        color: item.color,
                        sizes: item.details.map((d: any) => ({
                            size_name: d.size_name,
                            qty_input: d.qty_input,
                            qty_output: d.qty_output,
                            order_mi: 0, // Will be hydrated when lot is fetched
                            cut_qty: 0,
                            recorded_input: 0,
                            recorded_output: 0
                        }))
                    }));

                    setFormData({
                        production_date: p.production_date,
                        line_id: String(p.line_id),
                        entry_mode: p.items[0]?.details.length === 1 && p.items[0]?.details[0].size_name === 'TOTAL' ? 'output' : 'per-size',
                        remarks: p.remarks || '',
                        items: mappedItems
                    });

                    // Trigger hydration for each item
                    mappedItems.forEach((item: any, idx: number) => {
                        fetchLotDetails(item.lot_id, idx);
                    });
                }
            }
        };

        init();
    }, [id]);

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
                const res = await ProductionService.getSummary(lotId, color);
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

        // Handle Bulk Entry (Simplified) mode
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
        const newErrors: Record<string, boolean> = {};

        if (!formData.production_date) newErrors.production_date = true;
        if (!formData.line_id) newErrors.line_id = true;

        // Validate items
        formData.items.forEach((item, i) => {
            if (!item.lot_id) newErrors[`item-${i}-lot_id`] = true;
            if (!item.color) newErrors[`item-${i}-color`] = true;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast('Validation Error', 'Please complete all required fields highlighted in red.', 'destructive');
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

            if (isEdit) {
                await ProductionService.update(id, { ...formData, items: cleanedItems });
                showToast('Success', 'Production log updated successfully.', 'success');
            } else {
                await ProductionService.create({ ...formData, items: cleanedItems });
                showToast('Success', 'Production log saved successfully.', 'success');
            }
            setTimeout(() => {
                router.push('/admin/production');
            }, 1000);
        } catch (error: any) {
            console.error('Failed to save:', error);
            showToast('Error', error.response?.data?.message || 'Failed to save production log.', 'destructive');
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
                title={isEdit ? "Update Production Log" : "Create Production Log"}
                subtitle="Sewing Department"
                description={isEdit ? `ID: #${id}` : "Daily assembly input and output tracking."}
                action={
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/production')}
                        className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 transition-all font-black text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
                    >
                        <Icon icon="solar:alt-arrow-left-bold-duotone" className="w-5 h-5" />
                        <span>Back</span>
                    </Button>
                }
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden p-4 md:p-6 w-full mb-20 relative max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 items-end">
                    <div className="space-y-1.5 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Production Date</label>
                        <DatePicker
                            value={formData.production_date}
                            error={errors.production_date}
                            onChange={(val: string) => {
                                setFormData({ ...formData, production_date: val });
                                if (errors.production_date) setErrors({ ...errors, production_date: false });
                            }}
                        />
                    </div>

                    <div className="flex-1">
                        <Select
                            label="Source Line"
                            placeholder="Choose Production Line..."
                            options={lines}
                            value={formData.line_id}
                            error={errors.line_id}
                            onChange={(val) => {
                                setFormData({ ...formData, line_id: String(val) });
                                if (errors.line_id) setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.line_id;
                                    return next;
                                });
                            }}
                        />
                    </div>


                    <div className="flex flex-col items-end">
                        <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 border border-zinc-200">
                            <button
                                onClick={() => setFormData({ ...formData, entry_mode: 'output' })}
                                className={cn(
                                    "px-4 h-9 rounded-lg flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    formData.entry_mode === 'output' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:box-bold-duotone" className="w-3.5 h-3.5" />
                                <span>Bulk Output</span>
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, entry_mode: 'per-size' })}
                                className={cn(
                                    "px-4 h-9 rounded-lg flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                                    formData.entry_mode === 'per-size' ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-400 hover:text-zinc-600"
                                )}
                            >
                                <Icon icon="solar:ruler-bold-duotone" className="w-3.5 h-3.5" />
                                <span>Per Size</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
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
                            <div key={iIdx} className="group relative p-5 md:p-6 bg-zinc-50/40 rounded-[2.5rem] border border-zinc-100 hover:border-blue-100 hover:bg-white transition-all duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-lg">
                                            {iIdx + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-900">Garment Item Reference</h3>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Configuration breakdown</p>
                                        </div>
                                        {totalOutput > 0 && (
                                            <div className="ml-6 flex flex-col items-start px-4 py-1.5 bg-blue-50/50 border border-blue-100 rounded-xl">
                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Total Output</span>
                                                <span className="text-[13px] font-black text-blue-600">{totalOutput.toLocaleString()} PCS</span>
                                            </div>
                                        )}
                                    </div>
                                    {iIdx !== 0 && (
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                const newItems = formData.items.filter((_, idx) => idx !== iIdx);
                                                setFormData({ ...formData, items: newItems });
                                            }}
                                            className="text-red-500 hover:bg-red-50 flex items-center gap-2 px-3 h-10 rounded-xl transition-all"
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-end">
                                    <Select
                                        label="GL Number"
                                        placeholder="Search GL Code..."
                                        options={lots}
                                        value={item.lot_id}
                                        error={errors[`item-${iIdx}-lot_id`]}
                                        onChange={async (val) => {
                                            const newItems = [...formData.items];
                                            newItems[iIdx].lot_id = String(val);
                                            newItems[iIdx].color = '';
                                            newItems[iIdx].sizes = [];
                                            setFormData({ ...formData, items: newItems });
                                            fetchLotDetails(String(val), iIdx);
                                            if (errors[`item-${iIdx}-lot_id`]) {
                                                setErrors(prev => {
                                                    const next = { ...prev };
                                                    delete next[`item-${iIdx}-lot_id`];
                                                    return next;
                                                });
                                            }
                                        }}
                                    />
                                    {item.lot_id && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Color Variant</label>
                                            {lotDetails[iIdx] ? (
                                                <Select
                                                    placeholder="Choose Color..."
                                                    options={lotDetails[iIdx].map(c => ({ id: c.color, label: c.color }))}
                                                    value={item.color}
                                                    error={errors[`item-${iIdx}-color`]}
                                                    onChange={(val) => {
                                                        const colorData = lotDetails[iIdx].find(c => c.color === val);
                                                        updateItemColor(iIdx, String(val), colorData?.size_breakdown);
                                                        if (errors[`item-${iIdx}-color`]) {
                                                            setErrors(prev => {
                                                                const next = { ...prev };
                                                                delete next[`item-${iIdx}-color`];
                                                                return next;
                                                            });
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all font-bold text-[13px]"
                                                    placeholder="Enter color..."
                                                    value={item.color}
                                                    onChange={(e) => updateItemColor(iIdx, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {item.lot_id && item.sizes.length > 0 && (
                                    <div className="bg-white rounded-[1.8rem] border border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-1000">
                                        <div className="overflow-x-auto no-scrollbar">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-zinc-900 text-white">
                                                        <th className="px-4 py-4 text-left text-[9px] font-black uppercase tracking-widest border-r border-white/5 w-32">
                                                            Metrics
                                                        </th>
                                                        {sizesToShow.map((s, idx) => (
                                                            <th key={idx} className="px-3 py-4 text-center text-[9px] font-black uppercase tracking-widest min-w-[70px]">
                                                                {s.size_name}
                                                            </th>
                                                        ))}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <th className="px-3 py-4 text-center text-[9px] font-black uppercase tracking-widest min-w-[80px] bg-blue-600">
                                                                TOTAL
                                                            </th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-50">
                                                    {/* ORDER MI ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-5 py-3 bg-zinc-50 border-r border-zinc-100">
                                                            <span className="text-[9px] font-black text-zinc-900 uppercase">Order MI</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => (
                                                            <td key={idx} className="px-5 py-3 text-center font-bold text-zinc-500 text-[12px] bg-zinc-50/30">
                                                                {s.order_mi || 0}
                                                            </td>
                                                        ))}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-5 py-3 text-center font-black text-zinc-900 text-[12px] bg-blue-50/50">
                                                                {totalOrder}
                                                            </td>
                                                        )}
                                                    </tr>
                                                    {/* BALANCE ROW (CUT - OUTPUT) */}
                                                    <tr className="group/row">
                                                        <td className="px-5 py-4 bg-zinc-50 border-r border-zinc-100 relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                                                            <span className="text-[9px] font-black text-orange-600 uppercase">Balance (Cut)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const currentTotalOut = (Number(s.recorded_output) || 0) + (Number(s.qty_output) || 0);
                                                            const balance = (Number(s.cut_qty) || 0) - currentTotalOut;
                                                            return (
                                                                <td key={idx} className={cn(
                                                                    "px-5 py-3 text-center font-black text-[14px] transition-all",
                                                                    balance < 0 ? "text-red-500 bg-red-50" : "text-orange-600 bg-orange-50/20"
                                                                )}>
                                                                    {balance}
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className={cn(
                                                                "px-5 py-3 text-center font-black text-[14px]",
                                                                (totalCut - (totalRecordedOutput + totalOutput)) < 0 ? "text-red-500 bg-red-50" : "text-orange-600 bg-orange-50/50"
                                                            )}>
                                                                {totalCut - (totalRecordedOutput + totalOutput)}
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {/* PROGRESS ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-5 py-3 bg-zinc-50 border-r border-zinc-100">
                                                            <span className="text-[9px] font-black text-zinc-400 uppercase">Progress (%)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const currentTotalOut = (Number(s.recorded_output) || 0) + (Number(s.qty_output) || 0);
                                                            const progress = s.cut_qty > 0 ? (currentTotalOut / s.cut_qty) * 100 : 0;
                                                            return (
                                                                <td key={idx} className="px-4 py-3">
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={cn(
                                                                            "text-[10px] font-black mb-1",
                                                                            progress >= 100 ? "text-green-600" : "text-zinc-500"
                                                                        )}>
                                                                            {progress.toFixed(1)}%
                                                                        </span>
                                                                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                                                                            <div
                                                                                className={cn("h-full transition-all duration-500 shadow-sm", progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                                                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                        {formData.entry_mode === 'per-size' && (
                                                            <td className="px-4 py-3 bg-zinc-100/30">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-[10px] font-black text-zinc-900 mb-1">
                                                                        {totalCut > 0 ? ((totalRecordedOutput + totalOutput) / totalCut * 100).toFixed(1) : 0}%
                                                                    </span>
                                                                    <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-zinc-900 transition-all duration-500"
                                                                            style={{ width: `${Math.min(totalCut > 0 ? (totalRecordedOutput + totalOutput) / totalCut * 100 : 0, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                    {/* INPUT ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-5 py-4 bg-zinc-50 border-r border-zinc-100 relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                            <span className="text-[9px] font-black text-blue-700 uppercase">Input (SEWING)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const sIdx = item.sizes.findIndex(sz => sz.size_name === s.size_name);
                                                            return (
                                                                <td key={idx} className="px-3 py-4">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-11 bg-zinc-50 border border-zinc-100 rounded-xl text-center font-bold text-[13px] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/30 transition-all outline-none"
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
                                                            <td className="px-5 py-4 text-center font-black text-blue-700 text-[14px] bg-blue-50">
                                                                {totalInput}
                                                            </td>
                                                        )}
                                                    </tr>
                                                    {/* OUTPUT ROW */}
                                                    <tr className="group/row">
                                                        <td className="px-5 py-4 bg-zinc-50 border-r border-zinc-100 relative">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                                            <span className="text-[9px] font-black text-green-700 uppercase">Output (FINISH)</span>
                                                        </td>
                                                        {sizesToShow.map((s, idx) => {
                                                            const sIdx = item.sizes.findIndex(sz => sz.size_name === s.size_name);
                                                            return (
                                                                <td key={idx} className="px-3 py-4">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full h-11 bg-zinc-50 border border-zinc-100 rounded-xl text-center font-bold text-[13px] focus:ring-4 focus:ring-green-500/10 focus:bg-white focus:border-green-500/30 transition-all outline-none border-green-100/30"
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
                                                            <td className="px-5 py-4 text-center font-black text-green-700 text-[14px] bg-green-50">
                                                                {totalOutput}
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
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Daily Remarks</label>
                    <input
                        type="text"
                        placeholder="e.g. Normal flow, Power outage..."
                        className="w-full bg-zinc-50 border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-bold text-[13px]"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>

                <div className="mt-12 flex flex-col md:flex-row gap-5">
                    <div className="flex-1 flex flex-col md:flex-row gap-5 items-center">
                        <button
                            onClick={addItem}
                            className="flex-1 w-full py-8 border-2 border-dashed border-zinc-100 rounded-[2rem] text-zinc-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/5 transition-all flex flex-col items-center justify-center gap-2 group"
                        >
                            <Icon icon="solar:add-square-bold-duotone" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add Another Lot</span>
                        </button>

                        {grandTotalOutput > 0 && (
                            <div className="shrink-0 bg-blue-600 text-white px-8 py-5 rounded-[2rem] shadow-xl shadow-blue-500/20 border border-blue-400/30 flex flex-col items-center justify-center min-w-[160px] animate-in zoom-in duration-500">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Grand Total Output</span>
                                <span className="text-2xl font-black tracking-tight">{grandTotalOutput.toLocaleString()} <span className="text-xs opacity-60">PCS</span></span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="md:w-64 h-auto py-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[2rem] font-bold shadow-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                    >
                        <Icon icon={isLoading ? "solar:refresh-line-duotone" : "solar:check-circle-bold-duotone"} className={cn("w-6 h-6", isLoading && "animate-spin")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isLoading ? 'Saving...' : isEdit ? 'Update Production' : 'Save Production'}
                        </span>
                    </Button>
                </div>
            </div>

            <Toast
                open={toast.open}
                onOpenChange={(open) => setToast(prev => ({ ...prev, open }))}
                variant={toast.variant}
                className="data-state-open-animate-slide-in-top"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
                        toast.variant === 'success' ? "bg-green-50 border-green-100" : "bg-white/10 border-white/20"
                    )}>
                        <Icon
                            icon={toast.variant === 'success' ? "solar:check-circle-bold" : "solar:danger-triangle-bold"}
                            className={cn("w-5 h-5", toast.variant === 'success' ? "text-green-600" : "text-white")}
                        />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <ToastTitle className={cn(toast.variant === 'destructive' && "text-white")}>{toast.title}</ToastTitle>
                        <ToastDescription className={cn(toast.variant === 'destructive' && "text-white/90")}>
                            {toast.message}
                        </ToastDescription>
                    </div>
                </div>
            </Toast>
        </div>
    );
}
