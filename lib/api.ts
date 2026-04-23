export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = {
    async fetch(endpoint: string, options: RequestInit = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

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
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
            console.warn('Session expired or unauthenticated');
        }

        return response;
    },
    // ... rest of the functions


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
    },

    async download(endpoint: string, fileName: string) {
        const response = await this.fetch(endpoint, { method: 'GET' });
        if (!response.ok) throw new Error('Download failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
