'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { Button } from '@/app/components/ui/Button';
import { ConfirmationDialog } from '@/app/components/ui/ConfirmationDialog';
import { Dialog, DialogContent, DialogPortal } from '@/app/components/ui/Dialog';
import { Icon } from '@/app/components/ui/Icon';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select } from '@/app/components/ui/Select';
import { useAcl } from '@/hooks/useAcl';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAclManagement } from '../hooks/useAclManagement';
import { RolePermissionMatrix } from '../components/RolePermissionMatrix';
import { UserManagement } from '../components/UserManagement';

export const AclPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasPermission, isLoading: isAclLoading } = useAcl();
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'roles' || tab === 'permissions' || tab === 'users') {
            setActiveTab(tab as any);
        }
    }, [searchParams]);


    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Access Control' },
    ];

    const {
        users,
        roles,
        permissions,
        isLoading,
        isUserModalOpen,
        editingUser,
        userForm,
        isRoleModalOpen,
        editingRole,
        roleForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openRoleModal,
        closeRoleModal,
        handleSaveRole,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        updateRoleForm,
        togglePermissionInRoleForm,
        setConfirmDelete,
        handleUpdateRolePermissions
    } = useAclManagement();

    if (isAclLoading) return null;

    if (!hasPermission('acl.read')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-xl shadow-red-50">
                    <Icon icon="solar:shield-warning-bold-duotone" className="w-10 h-10 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest max-w-[300px] leading-relaxed">
                        You do not have the required administrative clearance (acl.read) to access this module.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto space-y-8 animate-in fade-in duration-700 relative">

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon icon="solar:shield-check-bold-duotone" className="w-10 h-10 text-zinc-900 animate-pulse" />
                        </div>
                    </div>
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900">Synchronizing Permissions</span>
                        <div className="flex gap-1 h-0.5 w-32 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-900 animate-loading-bar w-1/2"></div>
                        </div>
                    </div>
                </div>
            )}
            <PageHeader
                items={breadcrumbItems}
                title="Access"
                subtitle="Control"
                description="Configure granular access levels for enterprise modules and features."
                action={<>
                    <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200 shadow-inner">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'users' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'roles' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Roles
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'permissions' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Permissions
                        </button>
                        <button
                            onClick={handleSync}
                            className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-900 transition-all ml-1"
                            title="Synchronize Permissions"
                        >
                            <Icon icon="solar:refresh-bold-duotone" className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </>}
            />

            {/* Header */}

            {activeTab === 'users' ? (
                <UserManagement
                    users={users}
                    onAddUser={() => openUserModal()}
                    onEditUser={(user) => openUserModal(user)}
                    onDeleteUser={(id) => openDeleteConfirmation(id.toString(), 'user')}
                />
            ) : activeTab === 'roles' ? (
                <RolePermissionMatrix
                    roles={roles}
                    permissionsByFeature={permissions}
                    onSave={handleUpdateRolePermissions}
                    onAddRole={() => openRoleModal()}
                    isLoading={isLoading}
                />
            ) : (
                <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
                                <Icon icon="solar:key-minimalistic-square-bold-duotone" className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Permissions Catalog</h3>
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Master definitions of all system access points</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50">
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Feature Group</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Permission Name</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Action</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100">Label / Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.map((group: any) => (
                                    group.permissions.map((perm: any, idx: number) => (
                                        <tr key={perm.id} className="group hover:bg-zinc-50/50 transition-colors">
                                            {idx === 0 && (
                                                <td rowSpan={group.permissions.length} className="px-8 py-6 align-top border-b border-zinc-100 border-r border-zinc-50 bg-zinc-50/20">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-zinc-200 text-[10px] font-black text-zinc-900 uppercase tracking-widest shadow-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                        {group.feature}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-8 py-4 border-b border-zinc-100">
                                                <code className="text-[11px] font-black text-blue-600 bg-blue-50/50 px-2 py-1 rounded-md border border-blue-100/50">{perm.name}</code>
                                            </td>
                                            <td className="px-8 py-4 border-b border-zinc-100">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                    perm.action === 'read' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    perm.action === 'update' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    perm.action === 'delete' ? "bg-red-50 text-red-600 border-red-100" :
                                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                )}>
                                                    {perm.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 border-b border-zinc-100">
                                                <p className="text-[11px] font-bold text-zinc-600">{perm.label}</p>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Modal */}
            <Dialog open={isUserModalOpen} onOpenChange={closeUserModal}>
                <DialogPortal>
                    <DialogContent className="max-w-md">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-8">
                                {editingUser ? 'Update Professional' : 'Onboard New User'}
                            </h2>

                            <form onSubmit={handleSaveUser} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                    <input
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                        placeholder="Enter name..."
                                        value={userForm.name}
                                        onChange={e => updateUserForm({ name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Email Connection</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                        placeholder="user@example.com"
                                        value={userForm.email}
                                        onChange={e => updateUserForm({ email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Secure Passphrase</label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                        placeholder={editingUser ? "•••••••• (Leave blank to keep)" : "Enter password..."}
                                        value={userForm.password}
                                        onChange={e => updateUserForm({ password: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Administrative Role"
                                        options={roles.map((r: any) => ({ id: r.id.toString(), label: r.name }))}
                                        value={userForm.role_id}
                                        onChange={val => updateUserForm({ role_id: val.toString() })}
                                    />
                                    <Select
                                        label="Account Status"
                                        options={[
                                            { id: 'active', label: 'Active' },
                                            { id: 'inactive', label: 'Inactive' }
                                        ]}
                                        value={userForm.status}
                                        onChange={val => updateUserForm({ status: val as 'active' | 'inactive' })}
                                    />
                                </div>

                                <div className="flex gap-4 mt-8 pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={closeUserModal}
                                        className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>

            {/* Role Modal */}
            <Dialog open={isRoleModalOpen} onOpenChange={closeRoleModal}>
                <DialogPortal>
                    <DialogContent className="max-w-2xl">
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-8">
                                {editingRole ? 'Modify Access Role' : 'Create Access Level'}
                            </h2>

                            <form onSubmit={handleSaveRole} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Role Identifier</label>
                                        <input
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="e.g. Content Manager..."
                                            value={roleForm.name}
                                            onChange={e => updateRoleForm({ name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Scope Definition</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="Administrative scope description..."
                                            value={roleForm.description}
                                            onChange={e => updateRoleForm({ description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Access Grants</label>
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{roleForm.permissions.length} Permissions Selected</span>
                                    </div>
                                    
                                    <div className="bg-zinc-50 rounded-[2rem] border border-zinc-100 p-6 max-h-[300px] overflow-y-auto no-scrollbar space-y-6">
                                        {permissions.map((group: any) => (
                                            <div key={group.feature} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-3 bg-zinc-900 rounded-full"></div>
                                                    <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{group.feature}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {group.permissions.map((perm: any) => (
                                                        <div 
                                                            key={perm.id}
                                                            onClick={() => togglePermissionInRoleForm(perm.name)}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                                                                roleForm.permissions.includes(perm.name)
                                                                    ? "bg-white border-zinc-900 shadow-sm"
                                                                    : "bg-zinc-100/50 border-transparent hover:border-zinc-200"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                                roleForm.permissions.includes(perm.name)
                                                                    ? "bg-zinc-900 border-zinc-900 text-white"
                                                                    : "bg-white border-zinc-200 group-hover:border-zinc-400"
                                                            )}>
                                                                {roleForm.permissions.includes(perm.name) && <Icon icon="solar:check-read-bold" className="w-3 h-3" />}
                                                            </div>
                                                            <span className={cn(
                                                                "text-[11px] font-bold uppercase tracking-tight",
                                                                roleForm.permissions.includes(perm.name) ? "text-zinc-900" : "text-zinc-400"
                                                            )}>{perm.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-8 pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={closeRoleModal}
                                        className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                    >
                                        Deploy Role
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </DialogPortal>
            </Dialog>

            <ConfirmationDialog
                open={confirmDelete.open}
                onOpenChange={(open) => setConfirmDelete((prev: any) => ({ ...prev, open }))}
                title={`Delete ${confirmDelete.type === 'user' ? 'User Record' : 'Role'}?`}
                description={
                    confirmDelete.type === 'role'
                        ? "Deleting this role will automatically disassociate all assigned users. This action cannot be reversed."
                        : "This action is permanent and will remove all associated access and historical data immediately."
                }
                confirmLabel="Confirm Permanent Deletion"
                variant="destructive"
                onConfirm={handleDelete}
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};
