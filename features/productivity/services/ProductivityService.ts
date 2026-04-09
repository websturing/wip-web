export class ProductivityService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'productivity';

    static async getAll(date?: string) {
        const params = new URLSearchParams();
        if (date) params.append('date', date);

        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}?${params.toString()}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    static async getById(id: string) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    static async getLastInfo(lotId: string) {
        try {
            const url = new URL(`${this.baseUrl}/${this.resource}/last-info/${lotId}`);

            const response = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    static async save(data: any) {
        try {
            const url = data.id
                ? `${this.baseUrl}/${this.resource}/${data.id}`
                : `${this.baseUrl}/${this.resource}`;

            const response = await fetch(url, {
                method: data.id ? 'PUT' : 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    }

    static async delete(id: string) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
}
