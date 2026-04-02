'use client';

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import React, { createContext, useContext } from 'react';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthManager = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();

    const login = async (credentials: { email: string; password: string }) => {
        const result = await signIn("credentials", {
            email: credentials.email,
            password: credentials.password,
            redirect: false,
        });

        if (result?.error) {
            throw new Error(result.error);
        }
    };

    const logout = () => signOut({ callbackUrl: "/login" });

    const authValue = {
        user: (session as any)?.user || null,
        isLoading: status === "loading",
        login,
        logout,
        token: (session as any)?.accessToken || null,
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <AuthManager>
                {children}
            </AuthManager>
        </SessionProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
