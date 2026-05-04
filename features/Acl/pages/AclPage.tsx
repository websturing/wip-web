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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAclManagement } from '../hooks/useAclManagement';

export const AclPage = () => {
    const router = useRouter();
    const { hasPermission, isLoading: isAclLoading } = useAcl();
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');


    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'Access Control' },
    ];

    const {
        users,
        roles,
        isLoading,
        isUserModalOpen,
        editingUser,
        userForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        setConfirmDelete
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
                            Roles & Permissions
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
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-zinc-900 rounded-full"></div>
                            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Active Users</h3>
                        </div>
                        <Button
                            onClick={() => openUserModal()}
                            className="bg-zinc-900 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200"
                        >
                            <Icon icon="solar:user-plus-bold-duotone" className="w-4 h-4" />
                            Add User
                        </Button>
                    </div>

                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-100/50">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/30 transition-colors group">
                                        <td className="px-8 py-4">
                                            <span className="text-[13px] font-black text-zinc-900 uppercase tracking-tight">{user.name}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-[13px] font-bold text-zinc-500">{user.email}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                user.role?.name === 'Administrator' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                                            )}>
                                                {user.role?.name || 'No Role'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openUserModal(user)}
                                                    className="w-9 h-9 rounded-xl bg-zinc-50 text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center justify-center transition-all active:scale-90"
                                                >
                                                    <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmation(user.id, 'user')}
                                                    className="w-9 h-9 rounded-xl bg-zinc-50 text-zinc-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Roles Management Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-zinc-900 rounded-full"></div>
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">System Roles</h3>
                            </div>
                            <Button
                                onClick={() => router.push('/admin/acl/roles/create')}
                                className="bg-zinc-900 text-white rounded-2xl h-11 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-zinc-200"
                            >
                                <Icon icon="solar:shield-plus-bold-duotone" className="w-4 h-4" />
                                Create New Role
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map(role => (
                                <div key={role.id} className="bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-xl shadow-zinc-100/30 group hover:border-zinc-900/10 transition-all flex flex-col justify-between h-full">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                                                <Icon icon="solar:shield-keyhole-bold-duotone" className="w-6 h-6 text-zinc-400" />
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/admin/acl/roles/${role.id}/edit`)}
                                                    className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                                                >
                                                    <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirmation(role.id, 'role')}
                                                    className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[14px] font-black text-zinc-900 uppercase tracking-tight">{role.name}</h4>
                                            <p className="text-[11px] text-zinc-500 leading-relaxed min-h-[32px]">{role.description || 'No description provided for this role.'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900">{role.permissions?.length} Permissions</span>
                                            <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400">Assigned Grant</span>
                                        </div>
                                        <div className="flex -space-x-2">
                                            {role.permissions?.slice(0, 3).map((p: any, i: number) => (
                                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-zinc-900 flex items-center justify-center text-[8px] text-white font-black uppercase">
                                                    {p.action[0]}
                                                </div>
                                            ))}
                                            {role.permissions?.length > 3 && (
                                                <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[8px] text-zinc-400 font-black">
                                                    +{role.permissions.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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

                                <Select
                                    label="Administrative Role"
                                    options={roles.map(r => ({ id: r.id.toString(), label: r.name }))}
                                    value={userForm.role_id}
                                    onChange={val => updateUserForm({ role_id: val.toString() })}
                                />

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
