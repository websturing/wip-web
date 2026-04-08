export class ProductionService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'production';

    static async getLines() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/lines`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching lines:', error);
            throw error;
        }
    }

    static async getSummary(lotId: string, color: string) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/summary?lot_id=${lotId}&color=${encodeURIComponent(color)}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching summary:', error);
            throw error;
        }
    }

    static async getAll(date?: string) {
        try {
            const url = new URL(`${this.baseUrl}/${this.resource}`);
            if (date) url.searchParams.append('date', date);

            const response = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching production:', error);
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
            console.error('Error fetching production by ID:', error);
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
            console.error('Error creating production:', error);
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
            console.error('Error updating production:', error);
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
            console.error('Error deleting production:', error);
            throw error;
        }
    }

    static async importExcel(file: File) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${this.baseUrl}/${this.resource}/import`, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error importing production excel:', error);
            throw error;
        }
    }
}
