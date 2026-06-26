import { apiClient } from '@/lib/api';

export class LayingPlanningService {
    static get AVAILABLE_PARTS() {
        return ['TOP', 'PANTS', 'TANK TOP'];
    }

    static async getAll(page: number = 1) {
        try {
            const response = await apiClient.get(`/layingplanning?page=${page}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching laying-planning:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await apiClient.get(`/layingplanning/${id}?layingPlanningLots=true&layingPlanningCombine=true&layingPlanningTypes=true&layingPlanningColors=true&layingPlanningFabrics=true&layingPlanningGroupParts=true`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching laying-planning by ID:', error);
            throw error;
        }
    }

    static async create(payload: any) {
        try {
            const response = await apiClient.post('/layingplanning', payload);
            return await response.json();
        } catch (error) {
            console.error('Error creating laying-planning:', error);
            throw error;
        }
    }
}
