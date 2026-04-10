export class WipService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/wip`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching wip:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/wip/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching wip by ID:', error);
            throw error;
        }
    }
}
