export class WipReportService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'wip';

    static async getSummary() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/summary`, {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching wip summary:', error);
            throw error;
        }
    }
}
