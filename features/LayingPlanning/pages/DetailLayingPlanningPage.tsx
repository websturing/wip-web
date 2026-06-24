'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { cn } from '@/lib/utils';
import { useLayingPlanningDetail } from '../hooks/useLayingPlanningDetail';

export default function DetailLayingPlanningPage({ id }: { id: string }) {
    const router = useRouter();
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

    const InfoBlock = ({ label, value, icon, colSpan = 1 }: { label: string, value: string | number, icon: string, colSpan?: number }) => (
        <div className={cn("p-4 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-4 transition-all hover:border-blue-200 hover:shadow-sm", `md:col-span-${colSpan}`)}>
            <div className="w-10 h-10 rounded-lg bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                <Icon icon={icon} className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-zinc-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between animate-in fade-in duration-700">
                <PageHeader items={breadcrumbItems} />
                <Button onClick={() => router.push('/admin/laying-planning')} variant="ghost" className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                    <Icon icon="solar:arrow-left-bold" className="w-4 h-4 mr-2" /> Back to List
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden mb-12 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                {/* Header Summary */}
                <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/50">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <Icon icon="solar:document-text-bold-duotone" className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{data.serial_number}</h2>
                                {data.is_combine && (
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Combined</span>
                                )}
                            </div>
                            <p className="text-xs font-bold text-zinc-400 tracking-widest">
                                Created At: {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }).replace('.', ':')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 transition-all">
                            <Icon icon="solar:printer-bold" className="w-4 h-4 mr-2" /> Print PDF
                        </Button>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* General Information */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 pb-2">Reference Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InfoBlock label="Plan Date" value={data.plan_date || '-'} icon="solar:calendar-bold-duotone" />
                            <InfoBlock label="Planning Type" value={data.laying_planning_type?.name || '-'} icon="solar:layers-bold-duotone" />
                            <InfoBlock label="GL / Lot" value={data.lot?.lot_code || data.lot?.lot_number || '-'} icon="solar:box-bold-duotone" />
                            <InfoBlock label="Fabric Pattern" value={data.fabric_pattern || '-'} icon="solar:pallete-2-bold-duotone" />
                            <InfoBlock label="Color" value={`${data.color?.name || '-'} ${data.color_alias ? `(${data.color_alias})` : ''}`} icon="solar:drop-bold-duotone" />
                            <InfoBlock label="Fabric" value={`${data.fabric?.content || '-'} ${data.fabric_alias ? `(${data.fabric_alias})` : ''}`} icon="solar:hanger-2-bold-duotone" />
                            {data.is_combine && (
                                <InfoBlock label="Parent Planning ID" value={data.parent?.serial_number || data.laying_planning_parent_id || '-'} icon="solar:link-bold-duotone" colSpan={2} />
                            )}
                        </div>
                    </div>

                    {/* Size Breakdown */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Size Allocation Breakdown</h3>
                            <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                Total Quantities: {totalQty}
                            </div>
                        </div>

                        <div className="border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                    <tr>
                                        <th className="px-6 py-4">Size Code</th>
                                        <th className="px-6 py-4 text-right">Order Quantity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {sizes.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-8 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">No sizes available</td>
                                        </tr>
                                    ) : (
                                        sizes.map((sz: any) => (
                                            <tr key={sz.id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-zinc-900">
                                                    {sz.size?.size || sz.size?.size_code || sz.size?.name || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-zinc-900 text-right">
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
                </div>
            </div>
        </div>
    );
}
