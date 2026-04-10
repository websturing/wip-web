export interface Wip {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface WipState {
    data: Wip[];
    loading: boolean;
    error: string | null;
}
