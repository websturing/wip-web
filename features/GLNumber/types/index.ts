export interface GLNumberData {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface GLNumberState {
    data: GLNumberData[];
    loading: boolean;
    error: string | null;
}
