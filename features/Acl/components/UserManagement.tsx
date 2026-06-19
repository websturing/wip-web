'use client';

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role?: {
        name: string;
    };
    last_login_at?: string;
    status: 'active' | 'inactive';
}

interface UserManagementProps {
    users: User[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
}

export const UserManagement = ({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const uniqueRoles = useMemo(() => {
        const roles = new Set(users.map(u => u?.role?.name).filter(Boolean));
        return Array.from(roles) as string[];
    }, [users]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role?.name === roleFilter;
            return matchesSearch && matchesRole;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [users, searchQuery, roleFilter]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* User Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[1rem] border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Total Professionals</p>
                        <h4 className="text-3xl font-black text-zinc-900">{users.length}</h4>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-7 h-7" />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Active Now</p>
                        <h4 className="text-3xl font-black text-emerald-600">{users.filter(u => u.status === 'active').length}</h4>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Icon icon="solar:bolt-circle-bold-duotone" className="w-7 h-7" />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Admin Roles</p>
                        <h4 className="text-3xl font-black text-blue-600">{users.filter(u => u.role?.name === 'Administrator').length}</h4>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon icon="solar:shield-star-bold-duotone" className="w-7 h-7" />
                    </div>
                </div>
            </div>

            {/* User List Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-zinc-900 rounded-full"></div>
                    <div>
                        <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Active Directory</h3>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Manage your enterprise personnel and their access states.</p>
                    </div>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-1 md:flex-none justify-end w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon icon="solar:magnifer-linear" className="w-4 h-4 text-zinc-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 h-12 bg-white border border-zinc-200 rounded-xl text-[13px] font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all shadow-sm"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative w-full md:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full md:w-auto h-12 bg-white border border-zinc-200 rounded-xl px-4 pr-10 text-[13px] font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4 text-zinc-400" />
                        </div>
                    </div>

                    <Button
                        onClick={onAddUser}
                        className="w-full md:w-auto bg-zinc-900 text-white rounded-xl h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-zinc-300 active:scale-95 transition-all shrink-0"
                    >
                        <Icon icon="solar:user-plus-bold-duotone" className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Professional</span>
                    </Button>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-xl shadow-zinc-100/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Professional Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Security Role</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Digital Footprint</th>
                                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/30 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 group-hover:bg-white group-hover:border-zinc-900 group-hover:text-zinc-900 transition-all">
                                                <span className="text-[14px] font-black uppercase">{user.name.charAt(0)}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-zinc-900 uppercase tracking-tight">{user.name}</span>
                                                <span className="text-[11px] font-bold text-zinc-400">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            user.status === 'active'
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-red-50 text-red-500 border-red-100"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-red-500")}></div>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest",
                                                user.role?.name === 'Administrator' ? "text-red-500" : "text-blue-600"
                                            )}>
                                                {user.role?.name || 'No Role Assigned'}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">System Access Level</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-zinc-700">
                                                {user.last_login_at ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Icon icon="solar:clocks-value-bold-duotone" className="w-3.5 h-3.5 text-zinc-400" />
                                                        {formatDistanceToNow(new Date(user.last_login_at))} ago
                                                    </span>
                                                ) : 'Never Authenticated'}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">Last Login Record</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-end gap-2 transition-all">
                                            <button
                                                onClick={() => onEditUser(user)}
                                                className="w-10 h-10 rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 flex items-center justify-center transition-all active:scale-90 shadow-sm"
                                            >
                                                <Icon icon="solar:pen-bold-duotone" className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteUser(user.id)}
                                                className="w-10 h-10 rounded-xl bg-white border border-zinc-100 text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center transition-all active:scale-90 shadow-sm"
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
        </div>
    );
};
