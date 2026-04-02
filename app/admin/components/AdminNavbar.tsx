'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';

export const AdminNavbar = () => {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 px-12 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">System</span>
                <span className="h-1 w-1 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white underline underline-offset-4 decoration-blue-500">Live</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end mr-4">
                    <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                        {user?.name || 'Loading user...'}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                        {user?.email || 'admin@example.lan'}
                    </span>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px] shadow-xl shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer">
                    <div className="h-full w-full bg-white dark:bg-zinc-950 rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-black">👨‍💻</span>
                    </div>
                </div>
            </div>
        </header>
    );
};
