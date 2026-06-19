import re

file_path = "app/admin/components/AdminNavbar.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add useRouter import
if "import { useRouter }" not in content:
    content = content.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { useRouter } from 'next/navigation';")

# 2. Update useAuth and add state
if "const { user, logout } = useAuth();" not in content:
    content = content.replace("const { user } = useAuth();", "const { user, logout } = useAuth();\n    const router = useRouter();\n    const [isDropdownOpen, setIsDropdownOpen] = useState(false);")

# 3. Replace User Profile JSX
old_profile = """                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group pl-1">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className={cn(
                            "text-[12px] font-black transition-colors tracking-tight text-theme-text-main group-hover:text-theme-primary"
                        )}>
                            {user?.email}
                        </span>
                        <span className="text-[9px] font-black text-orange-500 bg-orange-50/10 px-1 rounded uppercase tracking-widest leading-none py-0.5">
                            Admin
                        </span>
                    </div>
                    <div className={cn(
                        "relative h-9 w-9 rounded-full ring-2 transition-all p-0.5 overflow-hidden shadow-sm",
                        isScrolled ? "ring-transparent group-hover:ring-white/20" : "ring-transparent group-hover:ring-blue-100"
                    )}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                            alt="avatar"
                            className="w-full h-full rounded-full bg-slate-50"
                        />
                    </div>
                    <Icon
                        icon="solar:alt-arrow-down-bold-duotone"
                        className={cn(
                            "w-3.5 h-3.5 group-hover:rotate-180 transition-all hidden xs:block",
                            isScrolled ? "text-theme-text-muted group-hover:text-theme-text-main" : "text-theme-text-muted group-hover:text-theme-primary"
                        )}
                    />
                </div>"""

new_profile = """                {/* User Profile */}
                <div className="relative">
                    <div 
                        className="flex items-center gap-3 cursor-pointer group pl-1"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className={cn(
                                "text-[12px] font-black transition-colors tracking-tight text-theme-text-main group-hover:text-theme-primary"
                            )}>
                                {user?.email}
                            </span>
                            <span className="text-[9px] font-black text-orange-500 bg-orange-50/10 px-1 rounded uppercase tracking-widest leading-none py-0.5">
                                {user?.role?.name || 'Admin'}
                            </span>
                        </div>
                        <div className={cn(
                            "relative h-9 w-9 rounded-full ring-2 transition-all p-0.5 overflow-hidden shadow-sm",
                            isScrolled ? "ring-transparent group-hover:ring-white/20" : "ring-transparent group-hover:ring-blue-100"
                        )}>
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}`}
                                alt="avatar"
                                className="w-full h-full rounded-full bg-slate-50"
                            />
                        </div>
                        <Icon
                            icon="solar:alt-arrow-down-bold-duotone"
                            className={cn(
                                "w-3.5 h-3.5 transition-all hidden xs:block",
                                isDropdownOpen ? "rotate-180" : "group-hover:rotate-180",
                                isScrolled ? "text-theme-text-muted group-hover:text-theme-text-main" : "text-theme-text-muted group-hover:text-theme-primary"
                            )}
                        />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-theme-bg-primary border border-theme-border rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-3 py-2 border-b border-theme-border mb-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted mb-0.5">Signed in as</p>
                                    <p className="text-xs font-bold text-theme-text-main truncate">{user?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <button 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-theme-text-main hover:bg-theme-secondary/10 hover:text-theme-primary transition-all text-left group/item"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            router.push('/admin/profile');
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-theme-secondary/5 flex items-center justify-center group-hover/item:bg-white transition-all shadow-sm">
                                            <Icon icon="solar:user-circle-bold-duotone" className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold">My Profile</span>
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all text-left group/item"
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            if (logout) logout();
                                            router.push('/login');
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover/item:bg-white transition-all shadow-sm">
                                            <Icon icon="solar:logout-2-bold-duotone" className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>"""

content = content.replace(old_profile, new_profile)

with open(file_path, "w") as f:
    f.write(content)

print("Updated AdminNavbar.tsx")
