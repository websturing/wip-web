export class LeadersService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/leaders`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching leaders:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/leaders/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching leaders by ID:', error);
            throw error;
        }
    }
}
