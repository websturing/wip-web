import { apiClient } from "@/lib/api";

export class ProductivityService {
    private static resource = '/productivity';

    static async getAll(date?: string) {
        const url = date ? `${this.resource}?date=${date}` : this.resource;
        const response = await apiClient.get(url);
        return await response.json();
    }

    static async getById(id: string) {
        const response = await apiClient.get(`${this.resource}/${id}`);
        return await response.json();
    }

    static async getLastInfo(lotId: string) {
        const response = await apiClient.get(`${this.resource}/last-info/${lotId}`);
        return await response.json();
    }

    static async save(data: any) {
        if (data.id) {
            const response = await apiClient.put(`${this.resource}/${data.id}`, data);
            return await response.json();
        } else {
            const response = await apiClient.post(this.resource, data);
            return await response.json();
        }
    }

    static async delete(id: string) {
        const response = await apiClient.delete(`${this.resource}/${id}`);
        return await response.json();
    }

    static async exportExcel(id: string, fileName: string) {
        await apiClient.download(`${this.resource}/${id}/export`, fileName);
    }

    static async exportDailyReport(date: string) {
        await apiClient.download(`${this.resource}/export-daily?date=${date}`, `Daily_Productivity_${date}.xlsx`);
    }
}
