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
import { RolePermissionMatrix } from '../components/RolePermissionMatrix';
import { UserManagement } from '../components/UserManagement';
import { MenuManagement } from '../components/MenuManagement';
import { useAclManagement } from '../hooks/useAclManagement';

export const AclPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasPermission, isLoading: isAclLoading } = useAcl();
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions' | 'menus'>('users');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'roles' || tab === 'permissions' || tab === 'users' || tab === 'menus') {
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
        menus,
        isLoading,
        isUserModalOpen,
        editingUser,
        userForm,
        isRoleModalOpen,
        editingRole,
        roleForm,
        isPermissionModalOpen,
        editingPermission,
        permissionForm,
        isMenuModalOpen,
        editingMenu,
        menuForm,
        confirmDelete,
        handleSync,
        openUserModal,
        closeUserModal,
        handleSaveUser,
        openRoleModal,
        closeRoleModal,
        handleSaveRole,
        openPermissionModal,
        closePermissionModal,
        handleSavePermission,
        openMenuModal,
        closeMenuModal,
        handleSaveMenu,
        openDeleteConfirmation,
        handleDelete,
        updateUserForm,
        updateRoleForm,
        updatePermissionForm,
        updateMenuForm,
        togglePermissionInRoleForm,
        toggleMenuInRoleForm,
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
                            onClick={() => setActiveTab('menus')}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === 'menus' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            Menus
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
                        onDeleteRole={(id) => openDeleteConfirmation(id, 'role')}
                        isLoading={isLoading}
                    />
                ) : activeTab === 'menus' ? (
                    <MenuManagement
                        menus={menus}
                        onAddMenu={() => openMenuModal()}
                        onEditMenu={(menu) => openMenuModal(menu)}
                        onDeleteMenu={(id) => openDeleteConfirmation(id.toString(), 'menu')}
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
                            <Button
                                onClick={() => openPermissionModal()}
                                className="bg-zinc-900 text-white rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                            >
                                <Icon icon="solar:add-circle-bold-duotone" className="w-4 h-4" />
                                Create Permission
                            </Button>
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
                                                <td className="px-8 py-4 border-b border-zinc-100 text-right opacity-0 group-hover:opacity-100 transition-all">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openPermissionModal(perm)}
                                                            className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center transition-all shadow-sm"
                                                        >
                                                            <Icon icon="solar:pen-bold-duotone" className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteConfirmation(perm.id.toString(), 'permission')}
                                                            className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all shadow-sm"
                                                        >
                                                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
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
                        <DialogContent className="max-w-4xl bg-white">
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
    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Sidebar Menus Allocation</label>
                                            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{roleForm.menus.length} Menus Selected</span>
                                        </div>

                                        <div className="bg-zinc-50 rounded-[2rem] border border-zinc-100 p-6 max-h-[250px] overflow-y-auto no-scrollbar space-y-2">
                                            {menus.map((menu: any) => (
                                                <div key={menu.id} className="flex flex-col gap-2">
                                                    <div
                                                        onClick={() => toggleMenuInRoleForm(menu.id.toString())}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                                                            roleForm.menus.includes(menu.id.toString())
                                                                ? "bg-white border-zinc-900 shadow-sm"
                                                                : "bg-zinc-100/50 border-transparent hover:border-zinc-200"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                            roleForm.menus.includes(menu.id.toString())
                                                                ? "bg-zinc-900 border-zinc-900 text-white"
                                                                : "bg-white border-zinc-200 group-hover:border-zinc-400"
                                                        )}>
                                                            {roleForm.menus.includes(menu.id.toString()) && <Icon icon="solar:check-read-bold" className="w-3 h-3" />}
                                                        </div>
                                                        <Icon icon={menu.icon || 'solar:folder-bold-duotone'} className="w-4 h-4 text-zinc-400" />
                                                        <span className={cn(
                                                            "text-[11px] font-bold uppercase tracking-tight",
                                                            roleForm.menus.includes(menu.id.toString()) ? "text-zinc-900" : "text-zinc-400"
                                                        )}>{menu.name}</span>
                                                    </div>
                                                    {menu.children && menu.children.length > 0 && menu.children.map((child: any) => (
                                                        <div
                                                            key={child.id}
                                                            onClick={() => toggleMenuInRoleForm(child.id.toString())}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ml-8",
                                                                roleForm.menus.includes(child.id.toString())
                                                                    ? "bg-white border-zinc-900 shadow-sm"
                                                                    : "bg-zinc-100/50 border-transparent hover:border-zinc-200"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                                roleForm.menus.includes(child.id.toString())
                                                                    ? "bg-zinc-900 border-zinc-900 text-white"
                                                                    : "bg-white border-zinc-200 group-hover:border-zinc-400"
                                                            )}>
                                                                {roleForm.menus.includes(child.id.toString()) && <Icon icon="solar:check-read-bold" className="w-3 h-3" />}
                                                            </div>
                                                            <Icon icon={child.icon || 'solar:folder-bold-duotone'} className="w-4 h-4 text-zinc-400" />
                                                            <span className={cn(
                                                                "text-[11px] font-bold uppercase tracking-tight",
                                                                roleForm.menus.includes(child.id.toString()) ? "text-zinc-900" : "text-zinc-400"
                                                            )}>{child.name}</span>
                                                        </div>
                                                    ))}
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

                {/* Permission Modal */}
                <Dialog open={isPermissionModalOpen} onOpenChange={closePermissionModal}>
                    <DialogPortal>
                        <DialogContent className="max-w-md">
                            <div className="p-8">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-8">
                                    {editingPermission ? 'Update Permission' : 'Create Custom Permission'}
                                </h2>
                                <form onSubmit={handleSavePermission} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Permission Name (Key)</label>
                                        <input
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="e.g. users.create"
                                            value={permissionForm.name}
                                            onChange={e => updatePermissionForm({ name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Feature Group</label>
                                        <input
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="e.g. Users Management"
                                            value={permissionForm.feature}
                                            onChange={e => updatePermissionForm({ feature: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Action Type"
                                            options={[
                                                { id: 'read', label: 'Read' },
                                                { id: 'write', label: 'Write' },
                                                { id: 'update', label: 'Update' },
                                                { id: 'delete', label: 'Delete' }
                                            ]}
                                            value={permissionForm.action}
                                            onChange={val => updatePermissionForm({ action: val as any })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Label / Description</label>
                                        <input
                                            className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="Short description..."
                                            value={permissionForm.label}
                                            onChange={e => updatePermissionForm({ label: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-8 pt-4">
                                        <Button type="button" variant="ghost" onClick={closePermissionModal} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500">Cancel</Button>
                                        <Button type="submit" className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Save Permission</Button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>

                {/* Menu Modal */}
                <Dialog open={isMenuModalOpen} onOpenChange={closeMenuModal}>
                    <DialogPortal>
                        <DialogContent className="max-w-md">
                            <div className="p-8">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-8">
                                    {editingMenu ? 'Update Menu' : 'Create Menu Item'}
                                </h2>
                                <form onSubmit={handleSaveMenu} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Label</label>
                                            <input required className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none" placeholder="Menu Name" value={menuForm.name} onChange={e => updateMenuForm({ name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Path</label>
                                            <input required className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none" placeholder="/dashboard" value={menuForm.path} onChange={e => updateMenuForm({ path: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Icon (Solar)</label>
                                            <input className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none" placeholder="solar:home-2-bold" value={menuForm.icon} onChange={e => updateMenuForm({ icon: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Sort Order</label>
                                            <input type="number" required className="w-full bg-zinc-50 border border-zinc-100 h-14 rounded-2xl px-6 font-bold text-[13px] focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none" value={menuForm.sort_order} onChange={e => updateMenuForm({ sort_order: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select
                                            label="Parent Menu"
                                            options={[
                                                { id: '', label: 'None (Top Level)' },
                                                ...menus.map((m: any) => ({ id: m.id.toString(), label: m.name }))
                                            ]}
                                            value={menuForm.parent_id}
                                            onChange={val => updateMenuForm({ parent_id: val.toString() })}
                                        />
                                        <Select
                                            label="Platform"
                                            options={[
                                                { id: 'web', label: 'Web Only' },
                                                { id: 'mobile', label: 'Mobile Only' },
                                                { id: 'both', label: 'Web & Mobile' }
                                            ]}
                                            value={menuForm.platform}
                                            onChange={val => updateMenuForm({ platform: val as any })}
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-8 pt-4">
                                        <Button type="button" variant="ghost" onClick={closeMenuModal} className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500">Cancel</Button>
                                        <Button type="submit" className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Save Menu</Button>
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
                            ? "Deleting this role will automatically reassign all affected users to the 'Guest' role. This action cannot be reversed."
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
