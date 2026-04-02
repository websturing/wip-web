'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AdminSidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'IE Layouts', path: '/admin/ielayout', icon: '⚡' },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    return (
        <aside className="w-80 h-screen sticky top-0 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-8 flex flex-col justify-between shadow-2xl">
            <div>
                <div className="mb-14 flex items-center gap-4 px-2">
                    <div className="p-2 bg-blue-600 rounded-2xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-white font-black italic tracking-tighter">GL</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                            Admin <span className="text-blue-600">Panel</span>
                        </h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            v1.0.4 - Premium
                        </p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${pathname === item.path
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-500/10 scale-105'
                                    : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white group'
                                }`}
                        >
                            <span className={`text-lg transition-transform group-hover:scale-110 ${pathname === item.path ? 'scale-110' : ''}`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-zinc-800 dark:to-zinc-800/50 rounded-[2rem] border border-blue-100 dark:border-zinc-700 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
                        Get Support
                    </p>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        Need help? Contact our tech team.
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="w-full py-4 px-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-100 dark:hover:bg-red-900/20 active:scale-95 transition-all outline outline-1 outline-transparent hover:outline-red-200 dark:hover:outline-red-900/30"
                >
                    System Logout
                </button>
            </div>
        </aside>
    );
};
