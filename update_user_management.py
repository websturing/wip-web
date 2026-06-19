import re

file_path = "features/Acl/components/UserManagement.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add imports
import_str = "import { useState, useMemo } from 'react';\nimport { Button } from '@/app/components/ui/Button';"
content = content.replace("import { Button } from '@/app/components/ui/Button';", import_str)

# 2. Add state
state_code = """export const UserManagement = ({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) => {
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
        });
    }, [users, searchQuery, roleFilter]);
"""
content = content.replace("export const UserManagement = ({ users, onAddUser, onEditUser, onDeleteUser }: UserManagementProps) => {", state_code)

# 3. Update header UI
header_ui = """                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 flex-1 md:flex-none justify-end w-full md:w-auto">
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
                </div>"""

# Find the old button and replace
content = re.sub(r'<Button[^>]*onClick=\{onAddUser\}[^>]*>.*?</Button>', header_ui, content, flags=re.DOTALL)

# 4. Map filteredUsers instead of users
content = content.replace("users.map((user)", "filteredUsers.map((user)")

with open(file_path, "w") as f:
    f.write(content)

print("Updated")
