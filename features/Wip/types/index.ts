export interface WipData {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface WipState {
    data: WipData[];
    loading: boolean;
    error: string | null;
}
