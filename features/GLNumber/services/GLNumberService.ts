import { apiClient } from "@/lib/api";

export class GLNumberService {
    private static resource = '/glnumber';

    static async getAll() {
        const response = await apiClient.get(this.resource);
        return await response.json();
    }

    static async getById(id: string | number) {
        const response = await apiClient.get(`${this.resource}/${id}`);
        return await response.json();
    }
}
