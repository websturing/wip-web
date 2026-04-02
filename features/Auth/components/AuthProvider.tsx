'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchMe = async () => {
        setIsLoading(true);
        try {
            const token = AuthService.getToken();
            if (token) {
                // If we had a direct /me endpoint, we'd use it.
                // For now, assume user is stored in localStorage or refetched.
                const storedUser = localStorage.getItem('auth_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            AuthService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        const response = await AuthService.login(credentials);
        setUser(response.user);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
