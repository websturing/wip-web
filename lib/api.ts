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

        // We don't remove the token here anymore to avoid race conditions
        if (response.status === 401) {
            console.warn('Unauthorized request to:', endpoint);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
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

    async patch(endpoint: string, body: any) {
        return this.fetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    async delete(endpoint: string) {
        return this.fetch(endpoint, { method: 'DELETE' });
    },

    async download(endpoint: string, fileName: string) {
        const response = await this.fetch(endpoint, { method: 'GET' });
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
