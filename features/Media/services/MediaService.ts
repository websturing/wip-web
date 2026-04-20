import { apiClient } from "@/lib/api";

export class MediaService {
    static async getAll(collection = 'default', page = 1) {
        const response = await apiClient.get(`/media?collection=${collection}&page=${page}`);
        return await response.json();
    }

    static async upload(file: File, collection = 'default') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('collection', collection);

        const response = await apiClient.fetch(`/media`, {
            method: 'POST',
            body: formData
        });

        return response.json();
    }

    static async update(id: string, name: string) {
        const response = await apiClient.put(`/media/${id}`, { original_name: name });
        return await response.json();
    }

    static async delete(id: string) {
        const response = await apiClient.delete(`/media/${id}`);
        return await response.json();
    }
}
