export interface Leaders {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface LeadersState {
    data: Leaders[];
    loading: boolean;
    error: string | null;
}
