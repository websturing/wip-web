export interface IeLayout {
    id: number;
    name: string;
    lot_id: string | null;
    lot?: {
        id: string;
        lot_code: string;
        lot_number: string;
    };
    price: number;
    department: string;
    total_smv: number;
    man_power_sewer: number;
    man_power_matching: number;
    man_power_qc: number;
    man_power_others: number;
    created_by_id: number | null;
    updated_by_id: number | null;
    created_at: string;
    updated_at: string;
    details?: TimeStudy[];
}

export interface TimeStudy {
    id: number;
    ie_layout_id: number;
    operation_id: number;
    handling_position: string;
    length: number;
    sequence: number;
    machine_type: string;
    machine_turn: number;
    operation?: Operation;
}

export interface Operation {
    id: number;
    name: string;
    code: string;
    sequence: number;
    machine_type: string;
    grade: string;
}
