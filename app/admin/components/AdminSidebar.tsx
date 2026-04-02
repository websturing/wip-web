'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminSidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();

    const sections = [
        {
            items: [
                { name: 'Dashboard', path: '/admin', icon: '📊', badge: null }
            ]
        },
        {
            title: 'Operation Planning',
            items: [
                { name: 'Leaders', path: '/admin/leaders', icon: '👤', badge: null },
                { name: 'GL Number', path: '/admin/gl-number', icon: '🔢', badge: null }
            ],
            badgeSection: '404'
        },
        { title: 'Lines', items: [], badgeSection: null },
        {
            title: 'Replacements',
            items: [
                { name: 'Tracking Ticket', path: '/admin/tracking', icon: '🎫', badge: '404' },
                { name: 'Ticket Request', path: '/admin/request', icon: '📋', badge: '404' },
                { name: 'Approval', path: '/admin/approval', icon: '✅', badge: '404' }
            ],
            badgeSection: '404'
        },
        {
            title: 'Transfers',
            items: [
                { name: 'Stock In', path: '/admin/stock-in', icon: '📦', badge: null },
                { name: 'Stock Out', path: '/admin/stock-out', icon: '📤', badge: '404' },
                { name: 'Defect', path: '/admin/defect', icon: '⚠️', badge: null }
            ],
            badgeSection: '404'
        },
        {
            title: 'User Management',
            items: [
                { name: 'Permissions', path: '/admin/permissions', icon: '🔑', badge: null },
                { name: 'Users', path: '/admin/users', icon: '👥', badge: '404' },
                { name: 'Employee', path: '/admin/employee', icon: '👷', badge: '404' }
            ],
            badgeSection: '404'
        }
    ];

    return (
        <div className="w-[260px] h-full bg-[#111827] rounded-[2rem] flex flex-col shadow-2xl relative overflow-hidden transition-all duration-500">
            <div className="flex-1 overflow-y-auto pt-10 pb-6 scrollbar-hide">
                <nav className="space-y-0.5">
                    {sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-4">
                            {section.title && (
                                <div className="px-6 py-2 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
                                        {section.title}
                                    </span>
                                    {section.badgeSection && (
                                        <span className="bg-red-500/10 text-red-500 px-1 py-0.5 rounded-[4px] text-[8px] font-black tracking-tighter">
                                            {section.badgeSection}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {section.items.map((item, iIdx) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link
                                            key={iIdx}
                                            href={item.path}
                                            className={`relative flex items-center justify-between pl-8 pr-4 py-3 transition-all group ${isActive
                                                    ? 'bg-[#1f2937] text-orange-400 font-black'
                                                    : 'text-zinc-500 hover:bg-[#1f2937]/50 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`${isActive ? 'text-orange-400' : 'text-zinc-600'}`}>{item.icon}</span>
                                                <span className="text-[12.5px] font-bold tracking-tight">{item.name}</span>
                                            </div>

                                            {item.badge && (
                                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-[4px] text-[8px] font-black">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {isActive && (
                                                <div className="absolute right-0 top-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            <button
                onClick={logout}
                className="h-20 flex items-center justify-center gap-3 bg-[#1f2937] text-orange-400/70 hover:text-red-400 transition-all font-black text-[13px] border-t border-zinc-800"
            >
                <span> Logout</span>
            </button>
        </div>
    );
};
