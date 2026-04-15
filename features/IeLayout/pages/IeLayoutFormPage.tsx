'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout, Operation, OperationSection, TimeStudy } from '../types';

const MACHINE_TURNS: Record<string, number> = {
    'O/L': 0.125,
    'S': 0.158,
    'C': 0.158,
    'BT': 0.158,
    'BH': 0.158,
    'O': 0.158,
    'S/M': 0.369,
    'IRON': 0.048
};

const SECTIONS: OperationSection[] = ['OUTLINE', 'OFFLINE', 'INLINE'];

export const IeLayoutFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [lots, setLots] = useState<any[]>([]);

    const [formData, setFormData] = useState<Partial<IeLayout>>({
        name: '',
        lot_id: '',
        price: 0,
        efficiency_constant: 1,
        department: 'Sewing',
        total_smv: 0,
        man_power_sewer: 0,
        man_power_matching: 0,
        man_power_qc: 0,
        man_power_others: 0,
        details: []
    });

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Engineering', icon: 'solar:programming-bold-duotone' },
        { label: 'IE Layouts', href: '/admin/ielayout', icon: 'solar:layers-bold-duotone' },
        { label: id ? 'Modify Specs' : 'Initialize Specs', icon: 'solar:add-circle-bold-duotone' },
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            setIsFetching(true);
            try {
                const [opsData, lotsData] = await Promise.all([
                    IeLayoutService.getOperations(),
                    IeLayoutService.getLots()
                ]);
                setOperations(opsData);
                setLots(lotsData);

                if (id) {
                    const layoutData = await IeLayoutService.getById(id as string);
                    if (layoutData) {
                        const sanitizedDetails = (layoutData.details || []).map(d => ({
                            ...d,
                            section: d.section || 'INLINE',
                            handling_position_value: Number(d.handling_position_value || 0),
                            length: Number(d.length || 0),
                            machine_turn: Number(d.machine_turn || 0),
                            man_power: Number(d.man_power || 0),
                            std_time: Number(d.std_time || 0),
                            target_hour: Number(d.target_hour || 0),
                            target_day: Number(d.target_day || 0),
                            smv: Number(d.smv || 0)
                        }));
                        setFormData({
                            ...layoutData,
                            price: Number(layoutData.price || 0),
                            efficiency_constant: Number(layoutData.efficiency_constant || 1),
                            total_smv: Number(layoutData.total_smv || 0),
                            man_power_sewer: Number(layoutData.man_power_sewer || 0),
                            man_power_matching: Number(layoutData.man_power_matching || 0),
                            man_power_qc: Number(layoutData.man_power_qc || 0),
                            man_power_others: Number(layoutData.man_power_others || 0),
                            details: sanitizedDetails
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsFetching(false);
            }
        };
        loadInitialData();
    }, [id]);

    const calculateRowMetrics = (detail: TimeStudy, efficiency: number) => {
        const key = detail.machine_type.toUpperCase();
        const turn = MACHINE_TURNS[key] || detail.machine_turn || 0;

        const posHandling = detail.handling_position_value || 0;
        const sewLength = detail.length || 0;

        const rawStdTime = posHandling > 0 ? (sewLength * turn) + posHandling : 0;
        const stdTime = Math.ceil(rawStdTime * 100) / 100;

        const targetHour = (posHandling > 0 && stdTime > 0) ? (3600 * efficiency) / stdTime : 0;
        const targetDay = targetHour * 8;
        const smv = targetHour > 0 ? 60 / targetHour : 0;

        return {
            ...detail,
            machine_turn: turn,
            std_time: stdTime,
            target_hour: targetHour,
            target_day: targetDay,
            smv: smv
        };
    };

    const addOperation = (section: OperationSection) => {
        const newDetail: TimeStudy = {
            operation_id: '',
            operation_name: '',
            section: section,
            handling_position: 'Seated',
            handling_position_value: 0,
            length: 0,
            man_power: 1,
            sequence: (formData.details?.length || 0) + 1,
            machine_type: '',
            machine_turn: 0
        };

        setFormData(prev => ({
            ...prev,
            details: [...(prev.details || []), newDetail]
        }));
    };

    const removeOperation = (indexInDetails: number) => {
        const newDetails = [...(formData.details || [])];
        newDetails.splice(indexInDetails, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const updateDetail = (indexInDetails: number, field: keyof TimeStudy, value: any) => {
        setFormData(prev => {
            const newDetails = [...(prev.details || [])];
            let detail = { ...newDetails[indexInDetails], [field]: value };

            if (field === 'operation_name') {
                const op = operations.find(o => o.name.toLowerCase() === value.toLowerCase());
                if (op) {
                    detail.operation_id = op.id;
                    detail.machine_type = op.machine_type;
                    detail.sequence = op.sequence || detail.sequence;
                } else {
                    detail.operation_id = '';
                }
            }

            if (['length', 'machine_type', 'handling_position_value', 'machine_turn', 'operation_name'].includes(field as string)) {
                detail = calculateRowMetrics(detail, prev.efficiency_constant || 1);
            }

            newDetails[indexInDetails] = detail;
            return { ...prev, details: newDetails };
        });
    };

    const handleSubmit = async () => {
        if (!formData.name) return alert('Layout name is required');

        // Calculate totals before saving
        const totalSmv = formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0) || 0;

        // Final data preparation
        const submitData = {
            ...formData,
            total_smv: totalSmv,
            // Ensure no circular references or extra frontend-only objects are passed if necessary
            // (The backend sanitization I added will handle this, but it's good practice)
        };

        setIsLoading(true);
        try {
            if (id) {
                await IeLayoutService.update(id as string, submitData);
            } else {
                await IeLayoutService.create(submitData);
            }
            router.push('/admin/ielayout');
        } catch (error) {
            console.error('Failed to save layout:', error);
            alert('Error saving layout. Please verify all operations have been correctly initialized.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatInt = (num: any) => {
        const val = Number(num);
        if (isNaN(val)) return '0';
        return Math.round(val).toString();
    };

    const formatPrec = (num: any) => {
        const val = Number(num);
        if (isNaN(val) || val === 0) return '0';
        return parseFloat(val.toFixed(3)).toString();
    };

    const sectionTotals = useMemo(() => {
        const totals: Record<OperationSection, { smv: number, mp: number }> = {
            OUTLINE: { smv: 0, mp: 0 },
            OFFLINE: { smv: 0, mp: 0 },
            INLINE: { smv: 0, mp: 0 }
        };
        formData.details?.forEach(d => {
            totals[d.section].smv += (d.smv || 0);
            totals[d.section].mp += (d.man_power || 0);
        });
        return totals;
    }, [formData.details]);

    if (isFetching) return (
        <div className="p-32 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin shadow-2xl"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 animate-pulse">Initializing Architecture Speeds...</span>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-1000">
            <PageHeader
                items={breadcrumbItems}
                title={id ? "Refine Architecture" : "Architect Specs"}
                subtitle="Industrial Engineering Design"
                description="Synchronize production sequences, machine turns, and target matrices across multi-section workflows."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 mt-10">
                <div className="lg:col-span-12">
                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-zinc-900 rounded-full"></div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">Initialize Architecture Specs</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Layout Name</label>
                                    <input
                                        className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all font-bold text-sm"
                                        placeholder="e.g. POLO SHIRT LINE 04"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Reference Lot</label>
                                    <Select
                                        options={lots.map(l => ({ id: l.id, label: l.lot_code }))}
                                        value={formData.lot_id || ''}
                                        onChange={(val) => setFormData(prev => ({ ...prev, lot_id: String(val) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Efficiency Factor (E$2)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-zinc-900 text-white h-14 rounded-2xl px-5 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-black text-lg"
                                        value={formData.efficiency_constant}
                                        onChange={(e) => {
                                            const newEff = Number(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                efficiency_constant: newEff,
                                                details: (prev.details || []).map(d => calculateRowMetrics(d, newEff))
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1">Base Price / Unit</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-5 transition-all font-bold text-sm"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-80 bg-zinc-50 rounded-3xl p-8 border border-zinc-100 flex flex-col justify-between items-center text-center">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-4">Total Layout SMV</span>
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-zinc-900">
                                        {formatPrec(formData.details?.reduce((acc, d) => acc + (d.smv || 0), 0))}
                                    </span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase italic">Min</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">
                                    {formData.details?.reduce((acc, d) => acc + (d.man_power || 0), 0)} Total MP
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 space-y-12">
                    {SECTIONS.map((section) => {
                        const sectionRows = formData.details?.filter(d => d.section === section) || [];
                        const sectionIndices = (formData.details || [])
                            .map((d, i) => d.section === section ? i : -1)
                            .filter(i => i !== -1);

                        return (
                            <div key={section} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            section === 'OUTLINE' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                section === 'OFFLINE' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        )}>
                                            {section} SEGMENT
                                        </div>
                                        <div className="h-px w-24 bg-zinc-100"></div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-md border border-zinc-100">
                                                {formatPrec(sectionTotals[section].smv)} <span className="text-zinc-400">SMV</span>
                                            </span>
                                            <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-md border border-zinc-100">
                                                {sectionTotals[section].mp} <span className="text-zinc-400">MP</span>
                                            </span>
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                                {sectionRows.length} Processes
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addOperation(section)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                                    >
                                        <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                                        Append Row
                                    </button>
                                </div>

                                <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-100/30">
                                    <div className="overflow-x-auto no-scrollbar">
                                        <table className="w-full text-left border-collapse min-w-[1200px]">
                                            <thead>
                                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest w-16">#</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest min-w-[250px]">Sequence / GSD Name</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Pos Handling</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">Sew Length</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">M/C Type</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center">M/C Turn</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-900 uppercase tracking-widest text-center bg-blue-50/30">MP</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-emerald-50/30">STD Time</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest bg-indigo-50/30 text-indigo-600">Tgt/Hr</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest">Tgt/Day</th>
                                                    <th className="px-6 py-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest text-right">SMV</th>
                                                    <th className="px-6 py-4 w-12 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                {sectionRows.map((detail, sIdx) => {
                                                    const globalIdx = sectionIndices[sIdx];
                                                    return (
                                                        <tr key={sIdx} className="hover:bg-zinc-50/30 transition-colors group">
                                                            <td className="px-6 py-3">
                                                                <span className="text-[10px] font-black text-zinc-300">{(sIdx + 1).toString().padStart(2, '0')}</span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        list="ops-datalist"
                                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-[13px] uppercase tracking-tight p-0 h-auto outline-none"
                                                                        placeholder="SEARCH OR TYPE SEQUENCE..."
                                                                        value={detail.operation_name || detail.operation?.name || ''}
                                                                        onChange={(e) => updateDetail(globalIdx, 'operation_name', e.target.value)}
                                                                    />
                                                                    <datalist id="ops-datalist">
                                                                        {operations.map(o => (
                                                                            <option key={o.id} value={o.name} />
                                                                        ))}
                                                                    </datalist>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-transparent border-none text-center focus:ring-4 focus:ring-zinc-900/5 transition-all text-[13px] font-black text-zinc-900"
                                                                    value={detail.handling_position_value}
                                                                    onChange={(e) => updateDetail(globalIdx, 'handling_position_value', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-transparent border-none text-center focus:ring-4 focus:ring-zinc-900/5 transition-all text-[13px] font-black text-zinc-900"
                                                                    value={detail.length}
                                                                    onChange={(e) => updateDetail(globalIdx, 'length', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <input
                                                                    className="w-20 bg-transparent border-none focus:ring-4 focus:ring-zinc-900/5 transition-all text-[11px] font-black text-zinc-400 uppercase"
                                                                    placeholder="M/C TYPE"
                                                                    value={detail.machine_type}
                                                                    onChange={(e) => updateDetail(globalIdx, 'machine_type', e.target.value.toUpperCase())}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3 text-center">
                                                                <span className="text-[12px] font-black text-zinc-400 italic">
                                                                    {formatPrec(detail.machine_turn)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-center bg-blue-50/20">
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    className="w-full bg-transparent border-none text-center focus:ring-4 focus:ring-blue-500/10 transition-all text-[13px] font-black text-blue-600"
                                                                    value={detail.man_power}
                                                                    onChange={(e) => updateDetail(globalIdx, 'man_power', Number(e.target.value))}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-3 bg-emerald-50/20">
                                                                <span className="text-[13px] font-black text-emerald-600">
                                                                    {formatPrec(detail.std_time)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 bg-indigo-50/20">
                                                                <span className="text-[13px] font-black text-indigo-600">
                                                                    {formatInt(detail.target_hour)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="text-[13px] font-bold text-zinc-400">
                                                                    {formatInt(detail.target_day)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <span className="text-[13px] font-black text-zinc-900">
                                                                    {formatPrec(detail.smv)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    onClick={() => removeOperation(globalIdx)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500"
                                                                >
                                                                    <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {sectionRows.length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-zinc-300 bg-zinc-50/50">
                                            <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-10 h-10 mb-2 opacity-5" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">Section Inactive</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:col-span-12 mt-12">
                    <div className="bg-zinc-900 text-white rounded-[2.5rem] px-12 py-8 shadow-2xl flex flex-col md:flex-row items-center justify-between border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

                        <div className="flex items-center gap-10 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Architecture Productivity</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black text-white">
                                        {formatInt((formData.details || []).reduce((acc, d) => acc + (d.target_day || 0), 0) / ((formData.details || []).length || 1))}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">Units / Line</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-12 bg-white/10"></div>

                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Manpower Metric</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-blue-400">{(formData.details || []).reduce((acc, d) => acc + (d.man_power || 0), 0)}</span>
                                    <span className="text-[9px] font-black text-white/50 uppercase">Total Headcount</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-8 md:mt-0 relative z-10 w-full md:w-auto">
                            <button
                                onClick={() => router.push('/admin/ielayout')}
                                className="px-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                            >
                                Discard Changes
                            </button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex-1 md:flex-none h-16 px-14 bg-blue-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-blue-600/20"
                            >
                                {isLoading ? (
                                    <Icon icon="solar:refresh-line-duotone" className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6" />
                                )}
                                <span>{id ? 'Commit Architecture' : 'Initialize Specs'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
