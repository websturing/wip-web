export interface LeaderItem {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface LeadersState {
    data: LeaderItem[];
    loading: boolean;
    error: string | null;
}
