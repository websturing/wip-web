export interface ProductionData {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductionState {
    data: ProductionData[];
    loading: boolean;
    error: string | null;
}
