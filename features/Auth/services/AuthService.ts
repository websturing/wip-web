import { AuthResponse } from '../types';

export class AuthService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

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
        const token = this.getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${this.baseUrl}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch user');
        return await response.json();
    }
}
