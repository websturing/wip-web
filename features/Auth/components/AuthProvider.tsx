'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // 1. Initialize from localStorage immediately (Synchronous)
    const [user, setUser] = useState<any | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('auth_user');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    });

    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // 2. Minimal validation on mount
    useEffect(() => {
        const validateSession = async () => {
            const storedToken = localStorage.getItem('auth_token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                // Just fetch the latest user data, don't logout on error immediately
                const userData = await AuthService.getMe();
                setUser(userData);
                localStorage.setItem('auth_user', JSON.stringify(userData));
            } catch (error) {
                console.warn('Session validation failed, but keeping local session for now', error);
                // If it's a 401 specifically, you might want to logout, 
                // but let's be lenient for now to fix the refresh issue.
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const data = await AuthService.login(credentials);
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
            router.push('/admin');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
