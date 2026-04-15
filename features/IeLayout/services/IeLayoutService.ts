import { apiClient } from '@/lib/api';
import { IeLayout, Operation } from '../types';

export class IeLayoutService {
    private static async request(path: string, options: RequestInit = {}) {
        const response = await apiClient.fetch(path, options);
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
    static async getOperations(): Promise<Operation[]> {
        const result = await this.request('/ielayout/operations');
        return result?.data || [];
    }

    // GL Numbers
    static async getGlNumbers(): Promise<unknown[]> {
        const result = await this.request('/reference/gl-groups');
        return result?.data?.data || [];
    }

    // Lots
    static async getLots(): Promise<{ id: string, lot_code: string }[]> {
        const result = await this.request('/reference/lots/list');
        return result?.data || [];
    }

    // Daily Manpower
    static async getDailyManpower(layoutId: number | string): Promise<unknown[]> {
        const result = await this.request(`/ielayout/manpower?ie_layout_id=${layoutId}`);
        return result?.data || [];
    }

    static async saveDailyManpower(data: unknown): Promise<unknown> {
        const result = await this.request('/ielayout/manpower', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return result?.data;
    }
}
