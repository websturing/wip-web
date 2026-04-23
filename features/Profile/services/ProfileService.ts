import { apiClient } from "@/lib/api";

export class ProfileService {
    static async getProfile() {
        const response = await apiClient.get('/profile');
        return await response.json();
    }

    static async updateProfile(data: { name: string; email: string }) {
        const response = await apiClient.put('/profile', data);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Update failed');
        return result;
    }

    static async changePassword(data: any) {
        const response = await apiClient.put('/profile/password', data);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Password update failed');
        return result;
    }

}
