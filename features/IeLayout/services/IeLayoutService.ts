import { IeLayout } from '../types';

export class IeLayoutService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll(): Promise<IeLayout[]> {
        const response = await fetch(`${this.baseUrl}/ielayout`);
        const result = await response.json();
        return result.data;
    }

    static async getById(id: number | string): Promise<IeLayout> {
        const response = await fetch(`${this.baseUrl}/ielayout/${id}`);
        const result = await response.json();
        return result.data;
    }

    static async create(data: Partial<IeLayout>): Promise<IeLayout> {
        const response = await fetch(`${this.baseUrl}/ielayout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result.data;
    }

    static async update(id: number | string, data: Partial<IeLayout>): Promise<IeLayout> {
        const response = await fetch(`${this.baseUrl}/ielayout/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result.data;
    }

    static async delete(id: number | string): Promise<void> {
        await fetch(`${this.baseUrl}/ielayout/${id}`, {
            method: 'DELETE',
        });
    }
}
