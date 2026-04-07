export interface GLNumber {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface GLNumberState {
    data: GLNumber[];
    loading: boolean;
    error: string | null;
}
