import { apiClient } from "@/lib/api";

export class ProductionService {
    private static resource = '/production';

    static async getLines() {
        const response = await apiClient.get(`${this.resource}/lines`);
        return await response.json();
    }

    static async getDashboardStats(range: number = 7) {
        const response = await apiClient.get(`${this.resource}/dashboard?range=${range}`);
        return await response.json();
    }

    static async getSummary(lotId: string, color: string, excludeProductionId?: string | number) {
        let url = `${this.resource}/summary?lot_id=${lotId}&color=${encodeURIComponent(color)}`;
        if (excludeProductionId) url += `&exclude_production_id=${excludeProductionId}`;
        const response = await apiClient.get(url);
        return await response.json();
    }

    static async getBulkSummary(lotIds: string[]) {
        const params = new URLSearchParams();
        lotIds.forEach(id => params.append('lot_ids[]', id));
        const response = await apiClient.get(`${this.resource}/bulk-summary?${params.toString()}`);
        return await response.json();
    }

    static async getLatestManpower(lineId: string, lotId: string, date: string) {
        const response = await apiClient.get(`${this.resource}/latest-manpower?line_id=${lineId}&lot_id=${lotId}&date=${date}`);
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

    static async update(id: string | number, data: any) {
        const response = await apiClient.put(`${this.resource}/${id}`, data);
        return await response.json();
    }

    static async delete(id: string | number) {
        const response = await apiClient.delete(`${this.resource}/${id}`);
        return await response.json();
    }

    static async importExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.fetch(`${this.resource}/import`, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    }

    static async getHistory(lotId: string, color: string, sizeName: string) {
        const response = await apiClient.get(`${this.resource}/history?lot_id=${lotId}&color=${encodeURIComponent(color)}&size_name=${encodeURIComponent(sizeName)}`);
        return await response.json();
    }
}
