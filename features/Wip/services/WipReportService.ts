import { apiClient } from "@/lib/api";

export class WipReportService {
    private static resource = '/wip';

    static async getSummary(selectedGls: string[] = []) {
        const query = selectedGls.length > 0
            ? '?' + selectedGls.map(gl => `selected_gls[]=${encodeURIComponent(gl)}`).join('&')
            : '';

        const response = await apiClient.get(`${this.resource}/summary${query}`);
        return await response.json();
    }

    static async saveExportQty(lotId: string, qty: number) {
        const response = await apiClient.post(`${this.resource}/export`, { lot_id: lotId, qty });
        return await response.json();
    }
}
