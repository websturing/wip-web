'use client';

import { useAppName } from '@/hooks/useAppName';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export const LoginForm = () => {

    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { prefix, suffix } = useAppName();

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
        <div className="w-full  max-w-[440px] flex flex-col items-center">


            {/* Light Glassmorphism Card */}
            <div className="w-full bg-white/40 backdrop-blur-2xl p-10 rounded-[0.8rem] border border-white/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-none"></div>

                {/* Logo */}
                <div className="mb-14 text-center">
                    <h1 className="text-5xl font-black text-zinc-900 tracking-tighter flex items-center justify-center gap-2">
                        <span className="capitalize">{prefix}</span>
                        <span className="text-zinc-400 font-normal text-xs mb-6 uppercase">{suffix}</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-semibold tracking-[0.2em] uppercase mt-2">Manufacturing Monitoring System</p>
                </div>

                {/* Error Area */}
                <div className={`w-full transition-all duration-300 overflow-hidden ${error ? 'mb-6 max-h-20' : 'max-h-0'}`}>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs font-bold tracking-wide text-center rounded-2xl border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">
                    {/* Email field */}
                    <div className="space-y-1.5">
                        <div className="relative group/input">
                            <label className="absolute left-6 top-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 group-focus-within/input:text-zinc-900 transition-colors">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                placeholder="[EMAIL_ADDRESS]"
                                required
                                className="w-full px-6 pt-7 pb-4 bg-white/60 text-zinc-900 text-sm font-medium rounded-2xl border border-zinc-100 focus:border-zinc-300 focus:bg-white outline-none transition-all placeholder:text-zinc-300"
                                value={credentials.email}
                                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5">
                        <div className="relative group/input">
                            <label className="absolute left-6 top-3 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 group-focus-within/input:text-zinc-900 transition-colors">PASSWORD</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                required
                                className="w-full px-6 pt-7 pb-4 bg-white/60 text-zinc-900 text-sm font-medium rounded-2xl border border-zinc-100 focus:border-zinc-300 focus:bg-white outline-none transition-all placeholder:text-zinc-300"
                                value={credentials.password}
                                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-[55%] -translate-y-1/2 text-zinc-300 hover:text-zinc-900 transition-all"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62" /><path d="M1 1l22 22" /><path d="M10.47 16a4 4 0 0 0 5.06-5.06" /><path d="M13.91 13.91" /><path d="M16.21 16.21A10 10 0 0 1 2 12c.5-1 1.73-3 5.46-5.1" /><path d="M21.54 15A10 10 0 0 0 22 12c-1.33-2.67-4.33-7-10-7-1.5 0-2.83.33-4.11.82" /></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4.5 bg-zinc-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? 'Processing...' : (
                                <>
                                    LOG IN
                                    <div className="w-5 h-5 rounded-full bg-[#00d1ff] flex items-center justify-center shadow-[0_0_10px_rgba(0,209,255,0.4)]">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Forgot Password */}
            <button className="mt-12 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-zinc-900 transition-colors">
                FORGOT YOUR PASSWORD?
            </button>
        </div>
    );
};
