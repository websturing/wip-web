import { apiClient } from '@/lib/api';

export interface MenuItem {
    id: string | number;
    name: string;
    path: string;
    icon: string;
    badge?: string | number | null;
    permission?: string;
    children?: MenuItem[];
    order?: number;
}

export class MenuService {
    static async getSidebarMenus(): Promise<MenuItem[]> {
        try {
            const response = await apiClient.get('/acl/menus');
            const data = await response.json();
            
            // Return data.data if the API wraps it, otherwise return data directly
            return data.data || data;
        } catch (error) {
            console.error('Failed to fetch sidebar menus:', error);
            // Return empty array on failure to prevent app crash
            return [];
        }
    }

    static async getAllMenus() {
        const res = await apiClient.get('/acl/menus/all');
        return await res.json();
    }

    static async createMenu(payload: any) {
        const res = await apiClient.post('/acl/menus', payload);
        if (!res.ok) throw new Error('Failed to create menu');
        return await res.json();
    }

    static async updateMenu(id: string | number, payload: any) {
        const res = await apiClient.put(`/acl/menus/${id}`, payload);
        if (!res.ok) throw new Error('Failed to update menu');
        return await res.json();
    }

    static async deleteMenu(id: string | number) {
        const res = await apiClient.delete(`/acl/menus/${id}`);
        return await res.json();
    }
}
