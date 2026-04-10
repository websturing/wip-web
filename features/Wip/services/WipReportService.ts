export class WipReportService {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    private static resource = 'wip';

    static async getSummary(selectedGls: string[] = []) {
        try {
            const url = new URL(`${this.baseUrl}/${this.resource}/summary`);
            if (selectedGls.length > 0) {
                selectedGls.forEach(gl => url.searchParams.append('selected_gls[]', gl));
            }

            const response = await fetch(url.toString(), {
                headers: { 'Accept': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching wip summary:', error);
            throw error;
        }
    }

    static async saveExportQty(lotId: string, qty: number) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.resource}/export`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lot_id: lotId, qty })
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving export qty:', error);
            throw error;
        }
    }
}
