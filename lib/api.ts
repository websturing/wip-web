import { getSession } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = {
    async fetch(endpoint: string, options: RequestInit = {}) {
        const session = await getSession();
        const token = (session as any)?.accessToken;

        const isFormData = options.body instanceof FormData;
        const headers: HeadersInit = {
            'Accept': 'application/json',
            ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Handle unauthenticated (optional: redirect to login)
            console.warn('Session expired or unauthenticated');
        }

        return response;
    },

    async get(endpoint: string) {
        return this.fetch(endpoint, { method: 'GET' });
    },

    async post(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    async put(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    async delete(endpoint: string) {
        return this.fetch(endpoint, { method: 'DELETE' });
    }
};
