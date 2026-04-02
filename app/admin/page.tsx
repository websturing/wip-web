'use client';

import { useAuth } from '@/features/Auth/components/AuthProvider';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        // Check if user just logged in
        const justLoggedIn = sessionStorage.getItem('just_logged_in');
        if (justLoggedIn) {
            setShowToast(true);
            // Remove the flag so it doesn't show again on refresh
            sessionStorage.removeItem('just_logged_in');

            // Auto hide after 5 seconds
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const roles = ['admin', 'Matching Girl'];
    const assignedLines = ['A1', 'A2', 'A3', 'A4', 'A5'];

    return (
        <div className="relative animate-in fade-in duration-700 min-h-screen bg-zinc-50 p-10">
            {/* Toast Notification to match Image 1 */}
            {showToast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 flex justify-center animate-in slide-in-from-top-10 duration-500">
                    <div className="w-full h-16 bg-white rounded-2xl border border-green-500/30 flex items-center px-6 shadow-xl shadow-green-500/10">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center p-2 mr-4 border border-green-200">
                            <span className="text-green-600 text-lg">✔️</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-zinc-900 tracking-tight">Great to have you back Super Admin!</h4>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Welcome Message */}
            <div className="mb-12">
                <h1 className="text-[2.2rem] font-bold text-zinc-900 tracking-tight mb-2">
                    Welcome Back, <span className="text-zinc-800">{user?.email || 'admin@admin.com'}</span>
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400">You have</span>
                    {roles.map((role, i) => (
                        <span
                            key={i}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${i === 0
                                ? 'bg-green-100/50 text-green-700 border border-green-200'
                                : 'bg-teal-100/50 text-teal-700 border border-teal-200'
                                }`}
                        >
                            {role}
                        </span>
                    ))}
                    <span className="text-xs font-bold text-zinc-400 ml-1">roles</span>
                </div>
            </div>

            {/* Assigned Lines to match Image 1 */}
            <div className="mb-14">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-4">Assigned Lines:</label>
                <div className="flex flex-wrap gap-2 items-center">
                    {assignedLines.slice(0, 3).map((line, i) => (
                        <div key={i} className="px-4 py-2 bg-white rounded-xl border border-zinc-100 shadow-sm flex items-center gap-2 group transition-all hover:scale-110 active:scale-95 cursor-pointer">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="text-xs font-bold text-zinc-900">{line}</span>
                        </div>
                    ))}
                    <span className="text-xs font-bold text-blue-600 pl-4">+17 more</span>
                </div>
            </div>

            {/* Empty space mimicking screenshot placeholder */}
            <div className="w-full h-px bg-zinc-100 mb-12"></div>
        </div>
    );
}
