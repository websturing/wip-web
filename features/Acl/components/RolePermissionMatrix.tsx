'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';

interface Permission {
    id: number;
    name: string;
    label: string;
    feature: string;
    action: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: Permission[];
}

interface RolePermissionMatrixProps {
    roles: Role[];
    permissionsByFeature: { feature: string; permissions: Permission[] }[];
    onSave: (roleId: number, permissions: string[]) => Promise<void>;
    onAddRole?: () => void;
    isLoading?: boolean;
}

export const RolePermissionMatrix = ({ roles, permissionsByFeature, onSave, onAddRole, isLoading }: RolePermissionMatrixProps) => {
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [draftPermissions, setDraftPermissions] = useState<Record<number, string[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize draft permissions from current roles
    useEffect(() => {
        const initialDraft: Record<number, string[]> = {};
        roles.forEach(role => {
            initialDraft[role.id] = role.permissions.map(p => p.name);
        });
        setDraftPermissions(initialDraft);

        if (roles.length > 0 && !selectedRoleId) {
            setSelectedRoleId(roles[0].id);
        }
    }, [roles, selectedRoleId]);

    const handleTogglePermission = (roleId: number, permissionName: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role?.name === 'Administrator') return; // Protect admin role

        setDraftPermissions(prev => {
            const current = prev[roleId] || [];
            const next = current.includes(permissionName)
                ? current.filter(p => p !== permissionName)
                : [...current, permissionName];
            return { ...prev, [roleId]: next };
        });
    };

    const handleSave = async () => {
        if (!selectedRoleId) return;
        setIsSaving(true);
        try {
            await onSave(selectedRoleId, draftPermissions[selectedRoleId] || []);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const initialDraft: Record<number, string[]> = {};
        roles.forEach(role => {
            initialDraft[role.id] = role.permissions.map(p => p.name);
        });
        setDraftPermissions(initialDraft);
    };

    const hasChanges = useMemo(() => {
        if (!selectedRoleId) return false;
        const role = roles.find(r => r.id === selectedRoleId);
        if (!role) return false;

        const original = role.permissions.map(p => p.name).sort().join(',');
        const current = (draftPermissions[selectedRoleId] || []).sort().join(',');
        return original !== current;
    }, [selectedRoleId, roles, draftPermissions]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Actions */}
            <div className={cn(
                "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm transition-all duration-500",
                hasChanges ? "sticky top-[-20px] z-50 shadow-2xl shadow-blue-900/10 border-blue-100 ring-4 ring-blue-50/30" : "relative"
            )}>
                <div>
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Role & Permission Matrix</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure granular access levels for enterprise modules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        disabled={!hasChanges || isSaving}
                        className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                    >
                        <Icon icon="solar:restart-bold-duotone" className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={cn(
                            "h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95",
                            hasChanges ? "bg-blue-600 text-white shadow-blue-200" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <Icon icon="solar:refresh-bold-duotone" className="w-4 h-4 animate-spin" />
                        ) : (
                            <Icon icon="solar:diskette-bold-duotone" className="w-4 h-4" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map(role => (
                    <div
                        key={role.id}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={cn(
                            "relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group",
                            selectedRoleId === role.id
                                ? "bg-white border-blue-600 shadow-xl shadow-blue-900/5 ring-4 ring-blue-50"
                                : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm"
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                selectedRoleId === role.id ? "bg-blue-600 text-white" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100"
                            )}>
                                <Icon icon={role.name === 'Administrator' ? "solar:shield-check-bold-duotone" : "solar:user-rounded-bold-duotone"} className="w-5 h-5" />
                            </div>
                            {selectedRoleId === role.id && (
                                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Icon icon="solar:check-read-bold" className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-[13px] font-black text-zinc-900 uppercase tracking-tight mb-1">{role.name}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed line-clamp-2">{role.description || 'Access level definition.'}</p>
                    </div>
                ))}

                <div
                    onClick={onAddRole}
                    className="p-6 rounded-[2rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-3 group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <Icon icon="solar:plus-bold" className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-blue-600">Add New Role</span>
                </div>
            </div>

            {/* Matrix Table */}

            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest w-1/2">Module & Feature</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">CREATE</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">READ</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">UPDATE</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">DELETE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {permissionsByFeature.map((group) => {
                                const getPerm = (actionType: string) =>
                                    group.permissions.find(p => {
                                        const act = p.action.toLowerCase();
                                        if (actionType === 'read') return act.includes('read') || act.includes('view') || act.includes('show');
                                        if (actionType === 'update') return act.includes('update') || act.includes('edit');
                                        if (actionType === 'delete') return act.includes('delete') || act.includes('destroy');
                                        return act.includes(actionType);
                                    });

                                return (
                                    <div key={group.feature} className="contents">
                                        <tr className="bg-zinc-50/30">
                                            <td className="px-8 py-6 align-middle border-b border-zinc-100/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
                                                    <span className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.15em]">{group.feature} Management</span>
                                                </div>
                                            </td>

                                            {['create', 'read', 'update', 'delete'].map((action) => {
                                                const perm = getPerm(action);
                                                return (
                                                    <td key={action} className="px-8 py-6 align-middle border-b border-zinc-100/50">
                                                        {perm ? (
                                                            <div className="flex justify-start">
                                                                {selectedRoleId && roles.find(r => r.id === selectedRoleId)?.name === 'Administrator' ? (
                                                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100">
                                                                        <Icon icon="solar:lock-bold-duotone" className="w-5 h-5" />
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => selectedRoleId && handleTogglePermission(selectedRoleId, perm.name)}
                                                                        className={cn(
                                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                                                                            selectedRoleId && draftPermissions[selectedRoleId]?.includes(perm.name)
                                                                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                                                                : "bg-white text-zinc-200 border-zinc-100 hover:border-zinc-300"
                                                                        )}
                                                                    >
                                                                        {selectedRoleId && draftPermissions[selectedRoleId]?.includes(perm.name) ? (
                                                                            <Icon icon="solar:check-read-bold" className="w-5 h-5 animate-in zoom-in duration-300" />
                                                                        ) : (
                                                                            <div className="w-2 h-2 rounded-full bg-zinc-100 group-hover:bg-zinc-200 transition-colors"></div>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-50/30 flex items-center justify-center border border-dashed border-zinc-100">
                                                                <div className="w-1 h-1 rounded-full bg-zinc-100"></div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </div>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Widget Style Image */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[12px] font-black text-zinc-900 uppercase tracking-widest">Authorization Flow</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full">Live Logs</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-50">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-blue-600">
                                <Icon icon="solar:user-check-bold-duotone" className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-zinc-900"><span className="text-blue-600">Super Admin</span> modified the <span className="font-black">Editor</span> role configuration.</p>
                                <p className="text-[9px] text-zinc-400 mt-0.5">2 minutes ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-50">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-zinc-400">
                                <Icon icon="solar:history-bold-duotone" className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-zinc-900"><span className="text-zinc-500 font-black">System</span> auto-locked <span className="font-black">Admin</span> role permissions.</p>
                                <p className="text-[9px] text-zinc-400 mt-0.5">1 hour ago</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col justify-between">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-6">
                        <Icon icon="solar:shield-warning-bold-duotone" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Role Lockdown Active</h3>
                        <p className="text-[11px] text-blue-100 leading-relaxed mb-6 opacity-80 font-medium">Critical roles like 'Admin' are currently in managed state. Direct modifications require MFA verification.</p>
                        <button className="w-full h-12 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                            Request Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
