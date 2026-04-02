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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login(credentials);
            router.push('/admin'); // Redirect to admin dashboard
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.01]">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                    Welcome <span className="text-blue-600 font-mono tracking-widest italic">Back</span>
                </h1>
                <p className="mt-2 text-sm text-zinc-500 font-medium tracking-tight">
                    Enter your credentials to access the console.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest text-center rounded-2xl border border-red-100 dark:border-red-900/30">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="group relative">
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all"
                        value={credentials.email}
                        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    />
                </div>
                <div className="group relative">
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-medium rounded-2xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
                {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="text-center pt-4">
                <a href="#" className="text-xs text-zinc-400 font-bold uppercase tracking-widest hover:text-blue-500 transition-colors">
                    Forgot Password?
                </a>
            </div>
        </form>
    );
};
