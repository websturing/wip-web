export interface Customer {
    id: string;
    name: string;
    country?: string;
}

export interface Lot {
    id: string;
    gl_id: string;
    lot_number: string;
    lot_code: string;
    gmt_qty?: number;
    style_no?: string;
    brand?: string;
    delivery_date?: string;
    is_cancelled: boolean;
}

export interface GlGroup {
    id: string;
    gl_number: string;
    customer_id: string;
    customer?: Customer;
    lots?: Lot[];
    created_at?: string;
    updated_at?: string;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}
