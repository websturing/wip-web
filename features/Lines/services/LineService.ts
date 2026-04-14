import { apiClient } from "@/lib/api";

export class LineService {
    private static resource = '/lines';

    static async getAll() {
        const response = await apiClient.get(this.resource);
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
}
