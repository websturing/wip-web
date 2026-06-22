export interface LayingPlanning {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface LayingPlanningState {
    data: LayingPlanning[];
    loading: boolean;
    error: string | null;
}
