'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { IeLayoutService } from '../services/IeLayoutService';
import { Operation } from '../types';

export default function OperationListPage() {
    const router = useRouter();

    const { data: operations = [], isLoading, isError, error } = useQuery<Operation[]>({
        queryKey: ['operations'],
        queryFn: () => IeLayoutService.getOperations(),
    });

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Industrial Eng.', href: '/admin/ielayout', icon: 'solar:layers-bold-duotone' },
        { label: 'Operation List', icon: 'solar:list-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700 relative min-h-screen">
            <PageHeader
                items={breadcrumbItems}
                title="Operation List"
                subtitle="Master Data"
                description="List of all available operations for Time Study and IE Layout."
                action={
                    <Button
                        onClick={() => {/* TODO: Implement Create Operation */}}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex items-center gap-2 h-12 px-6"
                    >
                        <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
                        <span className="font-bold text-xs tracking-widest uppercase">New Operation</span>
                    </Button>
                }
            />

            <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden p-6 mt-8">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-zinc-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Operations...</p>
                    </div>
                ) : isError ? (
                    <div className="py-20 text-center text-red-500">
                        <Icon icon="solar:danger-triangle-bold-duotone" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-bold">Failed to load operations</p>
                        <p className="text-xs opacity-70">{(error as Error).message}</p>
                    </div>
                ) : operations.length === 0 ? (
                    <div className="py-20 text-center text-zinc-400">
                        <Icon icon="solar:folder-with-files-bold-duotone" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-widest text-xs">No operations found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-zinc-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500 w-16 text-center">No</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500">Operation Code</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500">Operation Name</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500">Machine Type</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500">Grade</th>
                                    <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {operations.map((op, index) => (
                                    <tr key={op.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="py-3 px-4 text-center">
                                            <span className="text-xs font-bold text-zinc-400">{index + 1}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest">
                                                {op.code || '-'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-[13px] font-bold text-zinc-900">{op.name}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-semibold text-zinc-500">{op.machine_type || '-'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-black text-zinc-400 uppercase">{op.grade || '-'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => {/* TODO: Implement Edit */}}
                                            >
                                                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
