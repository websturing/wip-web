import { apiClient } from "@/lib/api";

export class GLNumberService {
    private static resource = '/reference/gl-groups';

    static async getAll(page: number = 1, perPage: number = 20, search: string = '') {
        const queryParams = new URLSearchParams({
            page: String(page),
            per_page: String(perPage)
        });
        
        if (search) {
            queryParams.append('search', search);
        }

        const response = await apiClient.get(`${this.resource}?${queryParams.toString()}`);
        return await response.json();
    }

    static async getById(id: string | number) {
        const response = await apiClient.get(`${this.resource}/${id}`);
        return await response.json();
    }
}
