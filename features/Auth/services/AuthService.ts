import { apiClient } from '@/lib/api';
import { AuthResponse } from '../types';

export class AuthService {
    static async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/login', credentials);
        const data = await response.json();

        // Save token
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
        }

        return data;
    }

    static logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    }

    static getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    static async getMe(): Promise<any> {
        const response = await apiClient.get('/auth/me');
        return await response.json();
    }
}
