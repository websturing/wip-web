export class PackingService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'packing';

    static async getSummary(lotId: string, color: string) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/summary?lot_id=${lotId}&color=${encodeURIComponent(color)}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching packing summary:', error);
            throw error;
        }
    }

    static async getBulkSummary(lotIds: string[]) {
        try {
            const params = new URLSearchParams();
            lotIds.forEach(id => params.append('lot_ids[]', id));

            const response = await fetch(`${this.baseUrl}/${this.resource}/bulk-summary?${params.toString()}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching packing bulk summary:', error);
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
            console.error('Error fetching packing data:', error);
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
            console.error('Error fetching packing by ID:', error);
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
            console.error('Error creating packing log:', error);
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
            console.error('Error deleting packing log:', error);
            throw error;
        }
    }
}
