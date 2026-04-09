import { IeLayout } from '../types';

export class IeLayoutService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    private static async request(path: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {}),
        };

        const response = await fetch(url, { ...options, headers });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API Request Failed');
        }

        return result;
    }

    static async getAll(): Promise<IeLayout[]> {
        const result = await this.request('/ielayout');
        return result.data;
    }

    static async getById(id: number | string): Promise<IeLayout> {
        const result = await this.request(`/ielayout/${id}`);
        return result.data;
    }

    static async getByLotId(lotId: string): Promise<IeLayout | null> {
        const result = await this.request(`/ielayout?lot_id=${lotId}`);
        // The index endpoint should support filtering by lot_id and return the first match or null
        return result.data?.length > 0 ? result.data[0] : null;
    }

    static async create(data: Partial<IeLayout>): Promise<IeLayout> {
        const result = await this.request('/ielayout', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result.data;
    }

    static async update(id: number | string, data: Partial<IeLayout>): Promise<IeLayout> {
        const result = await this.request(`/ielayout/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return result.data;
    }

    static async delete(id: number | string): Promise<void> {
        await this.request(`/ielayout/${id}`, {
            method: 'DELETE',
        });
    }

    // Operations
    static async getOperations(): Promise<any[]> {
        const result = await this.request('/ielayout/operations');
        return result?.data || [];
    }

    // GL Numbers
    static async getGlNumbers(): Promise<any[]> {
        const result = await this.request('/reference/gl-groups');
        return result?.data?.data || []; // Handle pagination structure
    }

    // Lots
    static async getLots(): Promise<any[]> {
        const result = await this.request('/reference/lots/list');
        return result?.data || [];
    }

    // Daily Manpower
    static async getDailyManpower(layoutId: number | string): Promise<any[]> {
        const result = await this.request(`/ielayout/manpower?ie_layout_id=${layoutId}`);
        return result?.data || [];
    }

    static async saveDailyManpower(data: any): Promise<any> {
        const result = await this.request('/ielayout/manpower', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result?.data;
    }
}
