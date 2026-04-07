'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

export const LoginForm = () => {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login(credentials);
            sessionStorage.setItem('just_logged_in', 'true');
            router.push('/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[450px] bg-white p-14 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-zinc-50 flex flex-col items-center">
            {/* Logo and Title */}
            <div className="mb-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-[1.5rem] flex items-center justify-center p-4 shadow-xl shadow-black/20">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 7.5V16.5M21 7.5L12 3L3 7.5M21 7.5L12 12M12 12L3 7.5M12 12V21M3 7.5V16.5M3 16.5L12 21M12 21L21 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7.5 9.75L12 12L16.5 9.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="text-[2.2rem] font-bold text-zinc-900 tracking-tight">WIP <span className="font-extrabold uppercase"></span></h1>
            </div>

            {/* Error Area */}
            <div className={`w-full transition-all duration-300 overflow-hidden ${error ? 'h-14 mb-4' : 'h-0'}`}>
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-xl border border-red-100">
                        {error}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6">
                {/* Username field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 pl-1">USERNAME</label>
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your username"
                            required
                            className="w-full pl-13 pr-6 py-4 bg-white text-zinc-900 text-sm font-medium rounded-xl border border-zinc-100 focus:border-zinc-300 outline-none transition-all placeholder:text-zinc-300"
                            value={credentials.email}
                            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 pl-1">PASSWORD</label>
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            className="w-full pl-13 pr-14 py-4 bg-white text-zinc-900 text-sm font-medium rounded-xl border border-zinc-100 focus:border-zinc-300 outline-none transition-all placeholder:text-zinc-300"
                            value={credentials.password}
                            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 transition-all active:scale-90"
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62" /><path d="M1 1l22 22" /><path d="M10.47 16a4 4 0 0 0 5.06-5.06" /><path d="M13.91 13.91" /><path d="M16.21 16.21A10 10 0 0 1 2 12c.5-1 1.73-3 5.46-5.1" /><path d="M21.54 15A10 10 0 0 0 22 12c-1.33-2.67-4.33-7-10-7-1.5 0-2.83.33-4.11.82" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4.5 bg-[#1a1a1a] text-white rounded-xl font-bold text-sm tracking-tight hover:bg-black hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Processing...' : 'Login to Dashboard'}
                </button>
            </form>

            <footer className="mt-12 text-zinc-400 text-[10px] font-medium tracking-tight">
                © 2026 PT Ghimli Indonesia. All rights reserved.
            </footer>
        </div>
    );
};
