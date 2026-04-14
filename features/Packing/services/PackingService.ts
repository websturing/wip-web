import { apiClient } from "@/lib/api";

export class PackingService {
    private static resource = '/packing';

    static async getSummary(lotId: string, color: string) {
        const response = await apiClient.get(`${this.resource}/summary?lot_id=${lotId}&color=${encodeURIComponent(color)}`);
        return await response.json();
    }

    static async getBulkSummary(lotIds: string[]) {
        const params = new URLSearchParams();
        lotIds.forEach(id => params.append('lot_ids[]', id));
        const response = await apiClient.get(`${this.resource}/bulk-summary?${params.toString()}`);
        return await response.json();
    }

    static async getAll(date?: string) {
        const url = date ? `${this.resource}?date=${date}` : this.resource;
        const response = await apiClient.get(url);
        return await response.json();
    }

    static async getById(id: string | number) {
        const response = await apiClient.get(`${this.resource}/${id}`);
        return await response.json();
    }

    static async create(data: any) {
        const response = await apiClient.post(this.resource, data);
        return await response.json();
    }

    static async delete(id: string | number) {
        const response = await apiClient.delete(`${this.resource}/${id}`);
        return await response.json();
    }
}
