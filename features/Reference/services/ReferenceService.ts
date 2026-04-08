export class ReferenceService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'reference';

    static async getLots(page: number = 1) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/lots?page=${page}`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching lots:', error);
            throw error;
        }
    }

    static async getLotList() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/lots/list`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching lot list:', error);
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
            console.error('Error importing excel:', error);
            throw error;
        }
    }

    static async deleteLot(id: string) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/lots/${id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting lot:', error);
            throw error;
        }
    }
}
