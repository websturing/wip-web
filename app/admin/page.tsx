'use client';

import {
    Toast,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/app/components/ui/Toast';
import { useAuth } from '@/features/Auth/components/AuthProvider';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [isToastOpen, setIsToastOpen] = useState(false);

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem('just_logged_in');
        if (justLoggedIn) {
            setIsToastOpen(true);
            sessionStorage.removeItem('just_logged_in');
        }
    }, []);

    const roles = ['admin', 'Matching Girl'];
    const assignedLines = ['A1', 'A2', 'A3', 'A4', 'A5'];

    return (
        <ToastProvider swipeDirection="up" duration={5000}>
            <div className="relative animate-in fade-in duration-700 min-h-screen bg-zinc-50 p-10">
                <Toast open={isToastOpen} onOpenChange={setIsToastOpen} className="data-state-open-animate-slide-in-top">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <ToastTitle>Logged In Successfully</ToastTitle>
                            <ToastDescription>
                                Great to have you back, {user?.email || 'Administrator'}!
                            </ToastDescription>
                        </div>
                    </div>
                </Toast>

                {/* Main Welcome Message */}
                <div className="mb-10 md:mb-12">
                    <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] font-bold text-zinc-900 tracking-tight mb-2">
                        Welcome Back, <span className="text-zinc-800">{user?.email || 'admin@admin.com'}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <span className="text-[10px] md:text-xs font-bold text-zinc-400">You have</span>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role, i) => (
                                <span
                                    key={i}
                                    className={`px-2.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${i === 0
                                        ? 'bg-green-100/50 text-green-700 border border-green-200'
                                        : 'bg-teal-100/50 text-teal-700 border border-teal-200'
                                        }`}
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-zinc-400">roles</span>
                    </div>
                </div>

                {/* Assigned Lines to match Image 1 */}
                <div className="mb-12 md:mb-14">
                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-4">Assigned Lines:</label>
                    <div className="flex flex-wrap gap-2 items-center">
                        {assignedLines.slice(0, 3).map((line, i) => (
                            <div key={i} className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl border border-zinc-100 shadow-sm flex items-center gap-2 group transition-all hover:scale-110 active:scale-95 cursor-pointer">
                                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-500"></span>
                                <span className="text-[11px] md:text-xs font-bold text-zinc-900">{line}</span>
                            </div>
                        ))}
                        <span className="text-[11px] md:text-xs font-bold text-blue-600 pl-2 md:pl-4">+17 more</span>
                    </div>
                </div>

                {/* Empty space mimicking screenshot placeholder */}
                <div className="w-full h-px bg-zinc-100 mb-12"></div>
            </div>
            <ToastViewport />
        </ToastProvider>
    );
}
