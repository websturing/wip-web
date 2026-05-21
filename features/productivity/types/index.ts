export interface PivotConfig {
    smv: number;
    last_step: number;
    target_plan: number;
    manpower: number;
    plan_manpower: number;
    sewer: number;
    plan_sewer: number;
    working_hour: number;
    section?: string;
    media_id?: string;
    media_url?: string;
    actual_output?: number;
    media?: {
        url: string;
    };
}

export interface Lot {
    id: string;
    lot_code: string;
    style_no?: string;
    gl_group?: {
        gl_number: string;
        customer?: {
            name: string;
        };
    };
    pivot?: PivotConfig;
}

export interface ProductivityLog {
    id: string | number;
    line_id: string | number;
    line?: {
        id: string | number;
        name: string;
    };
    date: string;
    sewer: number;
    manpower?: number;
    plan_manpower?: number;
    working_hour?: number;
    lots?: Lot[];
    lot?: Lot; // Backwards compatibility for single lot references
}

export interface ProductivityState {
    data: ProductivityLog[];
    loading: boolean;
    error: string | null;
}
