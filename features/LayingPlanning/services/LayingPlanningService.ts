export class LayingPlanningService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/laying-planning`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching laying-planning:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/laying-planning/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching laying-planning by ID:', error);
            throw error;
        }
    }
}
