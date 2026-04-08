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
import { ProductionService } from '../services/ProductionService';

export default function CreateProductionPage() {
    const router = useRouter();
    const [lines, setLines] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Sewing', icon: 'solar:t-shirt-bold-duotone' },
        { label: 'Production', href: '/admin/production', icon: 'solar:chart-2-bold-duotone' },
        { label: 'Create New Log', icon: 'solar:add-circle-bold-duotone' },
    ];

    // Form State
    const [formData, setFormData] = useState({
        production_date: new Date().toISOString().split('T')[0],
        line_id: '',
        items: [
            {
                lot_id: '',
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

    const [lotDetails, setLotDetails] = useState<Record<number, any[]>>({});

    useEffect(() => {
        // Fetch Lines
        ProductionService.getLines().then(res => {
            if (res && res.status === 'success') {
                setLines(res.data.map((l: any) => ({ id: l.id, label: l.name })));
            }
        });

        // Fetch Lots
        ReferenceService.getLotList().then(res => {
            if (res && res.status === 'success') {
                setLots(res.data.map((l: any) => ({
                    id: l.id,
                    label: (l.lot_code || '').replace(/^0+/, '')
                })));
            }
        });
    }, []);

    const fetchLotDetails = async (lotId: string, itemIdx: number) => {
        const lot = lots.find(l => l.id === lotId);
        if (!lot) return;

        // Ensure we use the formatted lot code for the external API if needed, 
        // but the API example used '65834-00'. 
        // Our 'l.lot_code' in database is '000065834-00'. 
        // Let's get the original lot_code if possible, or just re-add leading zeros if needed.
        // Actually, let's fetch the original lot from the list.
        const originalLot = (await ReferenceService.getLotList()).data.find((l: any) => l.id === lotId);
        if (!originalLot) return;

        try {
            const resp = await fetch(`http://cutting.glaindonesia.lan/api/summary-by-gl?gl_number=${originalLot.lot_code.replace(/^0+/, '')}`);
            const json = await resp.json();

            if (json.status === 200 && json.data.summary_by_color) {
                setLotDetails(prev => ({
                    ...prev,
                    [itemIdx]: json.data.summary_by_color
                }));

                // If only one color, auto-select it
                if (json.data.summary_by_color.length === 1) {
                    const colorData = json.data.summary_by_color[0];
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

        // Fetch summary of already recorded production in our app
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
        newItems[itemIdx] = {
            ...newItems[itemIdx],
            color: color,
            sizes: sizeBreakdown ? sizeBreakdown.map(s => ({
                size_name: s.size,
                cut_qty: parseInt(s.cut_qty) || 0,
                recorded_input: Number(recordedSummary[s.size]?.total_input || 0),
                recorded_output: Number(recordedSummary[s.size]?.total_output || 0),
                qty_input: 0,
                qty_output: 0
            })) : newItems[itemIdx].sizes.map(s => ({
                ...s,
                recorded_input: Number(recordedSummary[s.size_name]?.total_input || 0),
                recorded_output: Number(recordedSummary[s.size_name]?.total_output || 0)
            }))
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
        if (!formData.line_id || !formData.production_date) {
            alert('Please fill in Date and Line.');
            return;
        }

        setIsLoading(true);
        try {
            await ProductionService.create(formData);
            router.push('/admin/production');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save production log.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Create Production Log"
                subtitle="New Entry"
                description="Record daily assembly output and input quantities by line and lot."
            />

            <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden p-6 md:p-10 w-full mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Production Date</label>
                        <input
                            type="date"
                            className="w-full bg-zinc-50 border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-[13px]"
                            value={formData.production_date}
                            onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                        />
                    </div>
                    <Select
                        label="Source Line"
                        placeholder="Choose Production Line..."
                        options={lines}
                        value={formData.line_id}
                        onChange={(val) => setFormData({ ...formData, line_id: String(val) })}
                    />
                </div>

                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Production Item List</h3>
                        <div className="h-px flex-1 bg-zinc-100 mx-8"></div>
                    </div>

                    {formData.items.map((item, iIdx) => (
                        <div key={iIdx} className="group relative p-8 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 hover:border-blue-100 hover:bg-white transition-all duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                                        {iIdx + 1}
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Garment Product Reference</h3>
                                </div>
                                {formData.items.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            const newItems = formData.items.filter((_, idx) => idx !== iIdx);
                                            setFormData({ ...formData, items: newItems });
                                        }}
                                        className="text-red-500 hover:bg-red-50 p-2 h-auto rounded-xl"
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <Select
                                    label="Lot Configuration"
                                    placeholder="Search Lot Code..."
                                    options={lots}
                                    value={item.lot_id}
                                    onChange={(val) => {
                                        const newItems = [...formData.items];
                                        newItems[iIdx].lot_id = String(val);
                                        // Reset color and sizes when lot changes
                                        newItems[iIdx].color = '';
                                        newItems[iIdx].sizes = [];
                                        setFormData({ ...formData, items: newItems });
                                        fetchLotDetails(String(val), iIdx);
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
                                                onChange={(val) => {
                                                    const colorData = lotDetails[iIdx].find(c => c.color === val);
                                                    updateItemColor(iIdx, String(val), colorData?.size_breakdown);
                                                }}
                                            />
                                        ) : (
                                            <input
                                                className="w-full bg-white border border-zinc-100 h-12 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-[13px]"
                                                placeholder="e.g. Navy Blue"
                                                value={item.color}
                                                onChange={(e) => updateItemColor(iIdx, e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {item.lot_id && item.sizes.length > 0 && (
                                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                                    <>
                                        <div className="grid grid-cols-5 gap-4 mb-6 text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-2">
                                            <div className="col-span-1">Size</div>
                                            <div className="col-span-1 text-orange-500">To Cut Balance</div>
                                            <div className="col-span-1 text-blue-600">Input (Assembly)</div>
                                            <div className="col-span-1 text-green-600">Output (Finish)</div>
                                            <div className="col-span-1 text-right">Progress (%)</div>
                                        </div>
                                        <div className="space-y-4">
                                            {item.sizes.map((size: any, sIdx: number) => {
                                                const totalOutput = (size.recorded_output || 0) + (size.qty_output || 0);
                                                const progress = size.cut_qty > 0 ? (totalOutput / size.cut_qty) * 100 : 0;
                                                const remainingToCut = size.cut_qty - totalOutput;

                                                return (
                                                    <div key={sIdx} className="grid grid-cols-5 gap-4 items-center group/row">
                                                        <div className="font-black text-zinc-900 bg-zinc-50 h-10 flex items-center px-4 rounded-xl border border-zinc-100 tracking-widest text-[11px] transition-colors group-hover/row:bg-zinc-100">
                                                            {size.size_name}
                                                        </div>

                                                        {/* Balance To Cut (Based on Output per user request) */}
                                                        <div className={cn(
                                                            "text-center font-black text-[13px] h-10 flex items-center justify-center rounded-xl bg-orange-50/50 border border-orange-100/50",
                                                            remainingToCut < 0 ? "text-red-500" : "text-orange-600"
                                                        )}>
                                                            {remainingToCut}
                                                        </div>

                                                        <input
                                                            type="number"
                                                            tabIndex={(iIdx + 1) * 100 + sIdx}
                                                            className="bg-zinc-50 border border-zinc-100 h-10 rounded-xl text-center font-bold text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                                                            value={size.qty_input || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.items];
                                                                newItems[iIdx].sizes[sIdx].qty_input = parseInt(e.target.value) || 0;
                                                                setFormData({ ...formData, items: newItems });
                                                            }}
                                                        />
                                                        <input
                                                            type="number"
                                                            tabIndex={(iIdx + 1) * 100 + 50 + sIdx}
                                                            className="bg-zinc-50 border border-zinc-100 h-10 rounded-xl text-center font-bold text-[13px] focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none border-green-100/50"
                                                            value={size.qty_output || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...formData.items];
                                                                newItems[iIdx].sizes[sIdx].qty_output = parseInt(e.target.value) || 0;
                                                                setFormData({ ...formData, items: newItems });
                                                            }}
                                                        />

                                                        {/* Progress Percentage */}
                                                        <div className="text-right flex flex-col items-end pr-2">
                                                            <div className={cn(
                                                                "text-[11px] font-black",
                                                                progress >= 100 ? "text-green-600" : "text-zinc-400"
                                                            )}>
                                                                {progress.toFixed(1)}%
                                                            </div>
                                                            <div className="w-16 h-1 bg-zinc-100 rounded-full mt-1 overflow-hidden">
                                                                <div
                                                                    className={cn("h-full transition-all duration-500", progress >= 100 ? "bg-green-500" : "bg-blue-500")}
                                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row gap-4">
                    <button
                        onClick={addItem}
                        className="flex-1 py-8 border-2 border-dashed border-zinc-100 rounded-[2.5rem] text-zinc-400 hover:border-blue-200 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                        <Icon icon="solar:add-square-bold-duotone" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Another Product Line</span>
                    </button>

                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="md:w-64 h-auto py-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[2.5rem] font-bold shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
                    >
                        <Icon icon={isLoading ? "solar:refresh-line-duotone" : "solar:check-circle-bold-duotone"} className={cn("w-8 h-8", isLoading && "animate-spin")} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {isLoading ? 'Saving Log...' : 'Save Production Log'}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
