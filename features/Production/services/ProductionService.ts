export class ProductionService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/productions`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching productions:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/productions/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching productions by ID:', error);
            throw error;
        }
    }
}
