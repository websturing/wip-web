export class GLNumberService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/glnumber`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching glnumber:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/glnumber/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching glnumber by ID:', error);
            throw error;
        }
    }
}
