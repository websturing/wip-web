'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AclService } from '../services/AclService';

export const RoleFormPage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [roleForm, setRoleForm] = useState<{
        name: string;
        description: string;
        permissions: string[];
    }>({
        name: '',
        description: '',
        permissions: []
    });

    useEffect(() => {
        fetchInitialData();
    }, [id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [permRes, rolesRes] = await Promise.all([
                AclService.getPermissions(),
                id ? AclService.getRoles() : Promise.resolve({ data: [] })
            ]);

            setPermissions(permRes?.data || []);

            if (id) {
                const existingRole = rolesRes.data.find((r: any) => r.id.toString() === id);
                if (existingRole) {
                    setRoleForm({
                        name: existingRole.name,
                        description: existingRole.description || '',
                        permissions: existingRole.permissions.map((p: any) => p.name)
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch role data:', error);
        } finally {
            setTimeout(() => setIsLoading(false), 600);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (id) {
                await AclService.updateRole(id, roleForm);
            } else {
                await AclService.createRole(roleForm);
            }
            router.push('/admin/acl');
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Error saving role');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePermission = (permissionName: string) => {
        setRoleForm(prev => {
            const current = [...prev.permissions];
            if (current.includes(permissionName)) {
                return { ...prev, permissions: current.filter(p => p !== permissionName) };
            } else {
                return { ...prev, permissions: [...current, permissionName] };
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Configuration</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between group">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <Icon icon="solar:arrow-left-bold-duotone" className="w-4 h-4" />
                    Back to Control Center
                </button>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">System Online</span>
                </div>
            </div>

            <div className="space-y-1">
                <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tight">
                    {id ? 'Refine Role Scope' : 'Initialize System Role'}
                </h1>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em]">Configure operational boundaries and granular grants</p>
            </div>

            <form onSubmit={handleSave} className="space-y-12">
                {/* Basic Info Card */}
                <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-xl shadow-zinc-100/50 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Role Identifier</label>
                            <input
                                required
                                className="w-full bg-zinc-50 border border-zinc-100 h-16 rounded-[1.25rem] px-6 font-black text-[14px] uppercase focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                placeholder="e.g. QUALITY CONTROLLER"
                                value={roleForm.name}
                                onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Duty Description</label>
                            <input
                                className="w-full bg-zinc-50 border border-zinc-100 h-16 rounded-[1.25rem] px-6 font-bold text-[13px] focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                placeholder="What is the primary responsibility?"
                                value={roleForm.description}
                                onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 w-12 bg-zinc-900"></div>
                        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Capabilites Configuration</h3>
                        <div className="h-0.5 flex-1 bg-zinc-100"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {permissions.map((group) => (
                            <div key={group.feature} className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-100/30 space-y-6 hover:border-zinc-900/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100">
                                        <Icon icon="solar:widget-add-bold-duotone" className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <h4 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">{group.feature}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {group.permissions.map((p: any) => {
                                        const isSelected = roleForm.permissions.includes(p.name);
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => togglePermission(p.name)}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-95 group/btn",
                                                    isSelected
                                                        ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200"
                                                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-300"
                                                )}
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-tighter">{p.action}</span>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-md flex items-center justify-center transition-all",
                                                    isSelected ? "bg-white/20" : "bg-white border border-zinc-200"
                                                )}>
                                                    {isSelected && <Icon icon="solar:check-circle-bold" className="w-3 h-3 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-10 sticky bottom-8 bg-zinc-50/80 backdrop-blur-xl p-4 rounded-[2rem] border border-white/50 shadow-2xl">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
                    >
                        Abort Operation
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex-[2] h-16 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-zinc-300 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Saving Context...
                            </>
                        ) : (
                            <>
                                <Icon icon="solar:diskette-bold-duotone" className="w-5 h-5" />
                                {id ? 'Update Role Definition' : 'Commit New Role'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
