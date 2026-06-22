import { apiClient } from "@/lib/api";

export class ReferenceService {
    private static resource = '/reference';

    static async getLots(page: number = 1, search: string = '') {
        const response = await apiClient.get(`${this.resource}/lots?page=${page}&search=${encodeURIComponent(search)}`);
        return await response.json();
    }

    static async getLotList() {
        const response = await apiClient.get(`${this.resource}/lots/list`);
        return await response.json();
    }

    static async importExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.fetch(`${this.resource}/import`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }

    static async deleteLot(id: string) {
        const response = await apiClient.delete(`${this.resource}/lots/${id}`);
        return await response.json();
    }

    static async getGlSummary(glGroupId: string) {
        const response = await apiClient.get(`${this.resource}/gl-groups/${glGroupId}/summary`);
        return await response.json();
    }

    static async getColors(page: number = 1, search: string = '') {
        const response = await apiClient.get(`${this.resource}/colors?page=${page}&search=${encodeURIComponent(search)}`);
        return await response.json();
    }

    static async getGlnumbers(page: number = 1, search: string = '') {
        const response = await apiClient.get(`${this.resource}/gl-groups?flat=true`);
        return await response.json();
    }
}
