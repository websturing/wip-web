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
    efficiency_constant: number;
    department: string;
    is_gl_number?: boolean;
    gl_number?: string;
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

export type OperationSection = 'OUTLINE' | 'OFFLINE' | 'INLINE';

export interface TimeStudy {
    id?: number;
    ie_layout_id?: number;
    operation_id: number | string;
    operation_name?: string; // New: for custom operations
    section: OperationSection;
    handling_position: string;
    handling_position_value: number;
    length: number;
    sequence: number;
    machine_type: string;
    machine_turn: number;
    man_power?: number;
    std_time?: number;
    target_hour?: number;
    target_day?: number;
    smv?: number;
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
