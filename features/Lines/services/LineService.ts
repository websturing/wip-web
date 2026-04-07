export class LineService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'lines'; // Check prefix in backend, AppServiceProvider says strtolower(featureName). My feature is 'Lines' (plural) or 'Line'? 
    // I named it 'Lines' in backend. So prefix is 'api/lines'.

    static async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching lines:', error);
            throw error;
        }
    }

    static async getById(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching line by ID:', error);
            throw error;
        }
    }

    static async create(data: any) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating line:', error);
            throw error;
        }
    }

    static async update(id: string | number, data: any) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating line:', error);
            throw error;
        }
    }

    static async delete(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting line:', error);
            throw error;
        }
    }
}
