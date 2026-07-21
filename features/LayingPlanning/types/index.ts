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

export interface SizeItem {
    id: string | number
    size_id?: string | number
    order_qty: number
    ratio_per_size?: string | number
    size?:
    | string
    | {
        size?: string
        size_code?: string
        name?: string
    }
}


export interface Parts {
    id: string | number,
    itemPart: string,
    itemPartGroupCode: string
}

export interface GroupParts {
    id: string | number,
    itemPart: string,
    layingPlanningId: string | number
}

export interface PartItem {
    id: string | number
    item_part: string
    lot_code?: string
    laying_planning_id?: string
}