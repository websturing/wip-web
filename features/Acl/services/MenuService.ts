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
    /**
     * Fetches the menu structure authorized for the current user.
     * Expected endpoint: GET /api/menus
     */
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
}
