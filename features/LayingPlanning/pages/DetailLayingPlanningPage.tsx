'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLayingPlanningDetail } from '../hooks/useLayingPlanningDetail';

export default function DetailLayingPlanningPage({ id }: { id: string }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'lot' | 'size' | 'parts'>('lot');
    const { data, isLoading, error } = useLayingPlanningDetail(id);

    const breadcrumbItems = useBreadcrumb({
        'detail': { label: data?.serial_number || 'Loading...', icon: 'solar:document-text-bold-duotone' }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="inline-block w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <Icon icon="solar:danger-triangle-bold" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2">Failed to load details</h3>
                <p className="text-sm opacity-80">{error?.message || 'Record not found'}</p>
                <Button onClick={() => router.push('/admin/laying-planning')} variant="ghost" className="mt-6 border border-red-200 text-red-600 hover:bg-red-100">
                    Go Back
                </Button>
            </div>
        );
    }

    const sizes = data.size_details || [];
    const totalQty = sizes.reduce((sum: number, s: any) => sum + (s.order_qty || 0), 0);

    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="grid grid-cols-[140px_10px_auto] gap-2 items-start py-1.5 text-[13px]">
            <span className="text-zinc-500 font-medium">{label}</span>
            <span className="text-zinc-400 font-medium">:</span>
            <span className="text-zinc-900 font-bold">{value}</span>
        </div>
    );

    const HighlightCard = ({ title, value, icon, colorClass }: { title: string, value: React.ReactNode, icon: string, colorClass: string }) => (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-inner ${colorClass}`}>
                <Icon icon={icon} className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{title}</p>
                <p className="text-lg font-bold text-zinc-900 leading-none">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex items-center justify-between animate-in fade-in duration-700">
                <PageHeader items={breadcrumbItems} />
                <Button onClick={() => router.push('/admin/laying-planning')} variant="ghost" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                    <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" /> Back to List
                </Button>
            </div>


            {/* Detailed Specs Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] overflow-hidden mb-12 animate-in slide-in-from-bottom-4 duration-500 fade-in delay-200">
                <div className="p-8 pb-6">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100/80">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white     hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-white shadow-inner bg-gradient-to-br from-blue-500 to-indigo-600`}>
                                    <Icon icon="solar:document-text-bold-duotone" className="w-6 h-6 " />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Planning Code</p>
                                    <p className="text-lg font-bold text-zinc-900 leading-none">{data.serial_number}</p>
                                </div>
                            </div>
                        </div>
                        <Button className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
                            <Icon icon="solar:printer-bold" className="w-4 h-4 mr-2" /> Print PDF
                        </Button>
                    </div>


                    {/* Highlight Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500 fade-in delay-100">
                        <HighlightCard
                            title="GL Number + Lot"
                            value={data.lot?.lot_code || data.lot_code || '-'}
                            icon="tabler:number"
                            colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
                        />
                        <HighlightCard
                            title="Product Type"
                            value={data.is_set_item ? "Set Item" : "Single Item"}
                            icon={data.is_set_item ? "hugeicons:group" : "solar:t-shirt-bold-duotone"}
                            colorClass="bg-gradient-to-br from-red-300 to-red-500"
                        />
                        <HighlightCard
                            title="Planning Type"
                            value={data.laying_planning_type?.name || data.planning_type || '-'}
                            icon="mingcute:layer-fill"
                            colorClass="bg-gradient-to-br from-amber-400 to-orange-500"
                        />
                        <HighlightCard
                            title="Order Qty"
                            value={data.lot?.gmt_qty ? `${data.lot.gmt_qty} Pcs` : '-'}
                            icon="streamline-stickies-color:checking-order"
                            colorClass="bg-gradient-to-br from-zinc-200 to-zinc-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2 mt-5">
                        {/* Left Column Information */}
                        <div className="flex flex-col">
                            <DetailRow label="Buyer" value={data.lot?.gl_group?.customer?.name || data.lot?.brand || '-'} />
                            <DetailRow label="Style" value={data.lot?.style_no || '-'} />
                            <DetailRow label="Color" value={`${data.color_name || data.color?.name || '-'} ${data.color_alias ? `(${data.color_alias})` : ''}`} />
                            <DetailRow label="Set Item" value={data.is_set_item ? 'Yes (Multi-part)' : 'No'} />
                        </div>

                        {/* Right Column Information */}
                        <div className="flex flex-col">
                            <DetailRow label="Fabric Type" value={`${data.fabric_content || data.fabric?.content || '-'} ${data.fabric_alias ? `(${data.fabric_alias})` : ''}`} />
                            <DetailRow label="Delivery Date" value={data.lot?.delivery_date ? new Date(data.lot.delivery_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'} />
                            <DetailRow label="Plan Date" value={data.plan_date ? new Date(data.plan_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'} />
                            <DetailRow label="Fabric Pattern" value={data.fabric_pattern || '-'} />
                            <DetailRow label="Combine" value={data.is_combine ? `Yes (${data.combine_number || data.combine_group?.combine_number || 'Combined'})` : 'No'} />
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-8 mt-12 border-b border-zinc-100/80">
                        <button
                            onClick={() => setActiveTab('lot')}
                            className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'lot' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5" />
                            Lot Details
                            {activeTab === 'lot' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('size')}
                            className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'size' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            <Icon icon="solar:pie-chart-2-bold-duotone" className="w-5 h-5" />
                            Size Allocation
                            {activeTab === 'size' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('parts')}
                            className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === 'parts' ? 'text-blue-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            <Icon icon="solar:layers-bold-duotone" className="w-5 h-5" />
                            Parts Setup
                            {activeTab === 'parts' && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-8 animate-in fade-in duration-500">
                        {activeTab === 'lot' && (
                            <div>ini lot</div>
                        )}

                        {activeTab === 'size' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Size Allocation Breakdown</h3>
                                    <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        Total Quantities: {totalQty}
                                    </div>
                                </div>

                                <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <table className="w-full text-left">
                                        <thead className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                                            <tr>
                                                <th className="px-6 py-4">Size Code</th>
                                                <th className="px-6 py-4 text-right">Order Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {data.sizes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={2} className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">No sizes available</td>
                                                </tr>
                                            ) : (
                                                sizes.map((sz: any) => (
                                                    <tr key={sz.id} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-bold text-zinc-800">
                                                            {sz.size?.size || sz.size?.size_code || sz.size?.name || 'Unknown'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-zinc-700 text-right">
                                                            {sz.order_qty}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="bg-zinc-900 text-white">
                                            <tr>
                                                <td className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white/50">Total Allocated</td>
                                                <td className="px-6 py-4 text-[14px] font-bold text-white text-right">{totalQty} pcs</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'parts' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Parts Component Setup</h3>
                                    <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        Total Parts: {(data.group_parts?.length > 0 ? data.group_parts : data.parts)?.length || 0}
                                    </div>
                                </div>

                                <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                    <table className="w-full text-left">
                                        <thead className="bg-zinc-50/80 border-b border-zinc-100 text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">
                                            <tr>
                                                <th className="px-6 py-4">Part Name</th>
                                                <th className="px-6 py-4">GL (Lot)</th>
                                                <th className="px-6 py-4 text-center w-24">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {(!data.group_parts && !data.parts) || (data.group_parts?.length === 0 && data.parts?.length === 0) ? (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">No parts available</td>
                                                </tr>
                                            ) : (
                                                (data.group_parts?.length > 0 ? data.group_parts : data.parts).map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-bold text-zinc-800">
                                                            {p.item_part}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-zinc-700">
                                                            {p.lot_code || data.lot_code}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Button 
                                                                onClick={() => {
                                                                    if (p.laying_planning_id) {
                                                                        router.push(`/admin/laying-planning/${p.laying_planning_id}`);
                                                                    }
                                                                }}
                                                                variant="ghost" 
                                                                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-blue-100/50"
                                                                disabled={!p.laying_planning_id || p.laying_planning_id === data.id}
                                                            >
                                                                {p.laying_planning_id === data.id ? 'Current' : 'Detail'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
