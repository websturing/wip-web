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
            const response = await apiClient.get(`/layingplanning/${id}?layingPlanningLots=true&layingPlanningCombine=true&layingPlanningTypes=true&layingPlanningColors=true&layingPlanningFabrics=true&layingPlanningGroupParts=true&layingPlanningSizes=true`);
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

    static async getDetailTypes() {
        try {
            const response = await apiClient.get('/layingplanning/detail-types?per_page=100');
            return await response.json();
        } catch (error) {
            console.error('Error fetching detail types:', error);
            throw error;
        }
    }

    static async getDetails(lpId: string | number) {
        try {
            const response = await apiClient.get(`/layingplanning/${lpId}/details`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching details:', error);
            throw error;
        }
    }

    static async createDetail(lpId: string | number, payload: any) {
        try {
            const response = await apiClient.post(`/layingplanning/${lpId}/details`, payload);
            return await response.json();
        } catch (error) {
            console.error('Error creating detail:', error);
            throw error;
        }
    }

    static async updateDetail(lpId: string | number, detailId: string | number, payload: any) {
        try {
            const response = await apiClient.put(`/layingplanning/${lpId}/details/${detailId}`, payload);
            return await response.json();
        } catch (error) {
            console.error('Error updating detail:', error);
            throw error;
        }
    }

    static async deleteDetail(lpId: string | number, detailId: string | number) {
        try {
            const response = await apiClient.delete(`/layingplanning/${lpId}/details/${detailId}`);
            return await response.json();
        } catch (error) {
            console.error('Error deleting detail:', error);
            throw error;
        }
    }

    static async downloadPdf(id: string | number, serialNumber: string) {
        try {
            await apiClient.download(`/layingplanning/${id}/export-pdf`, `Laying_Planning_Report_${serialNumber}.pdf`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    }
}
