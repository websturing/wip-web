'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    // Check for existing session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const loginMutation = useMutation({
        mutationFn: (credentials: { email: string; password: string }) => AuthService.login(credentials),
        onSuccess: (data) => {
            if (data.token) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                queryClient.setQueryData(['auth', 'user'], data.user);
                router.push('/admin');
            }
        }
    });

    // Use query for fetching latest user data
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ['auth', 'user'],
        queryFn: () => AuthService.getMe(),
        enabled: !!token,
        retry: false,
    });

    // Sync state with query data
    useEffect(() => {
        if (userData) {
            setUser(userData);
            localStorage.setItem('auth_user', JSON.stringify(userData));
        }
    }, [userData]);

    const login = async (credentials: { email: string; password: string }) => {
        await loginMutation.mutateAsync(credentials);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        queryClient.clear();
        router.push('/login');
    };

    const isLoading = loginMutation.isPending || (token ? isUserLoading : false);

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
