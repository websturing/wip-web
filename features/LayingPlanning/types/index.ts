export interface LayingPlanningModel {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface LayingPlanningState {
    data: LayingPlanningModel[];
    loading: boolean;
    error: string | null;
}
