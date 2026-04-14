import { apiClient } from "@/lib/api";

export class LeadersService {
    private static resource = '/leaders';

    static async getAll() {
        const response = await apiClient.get(this.resource);
        return await response.json();
    }

    static async getById(id: string | number) {
        const response = await apiClient.get(`${this.resource}/${id}`);
        return await response.json();
    }
}
