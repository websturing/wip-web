import * as z from "zod";

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

export const PartsApiSchema = z.object({
    id: z.union([z.string(), z.number()]),
    item_part: z.string(),
    item_part_group_code: z.string(),
}).transform((data) => ({
    // Transform ke camelCase di sini
    id: data.id,
    itemPart: data.item_part,
    itemPartGroupCode: data.item_part_group_code,
}));

export type Parts = z.output<typeof PartsApiSchema>;


export const GroupPartsApiSchema = z.object({
    id: z.union([z.string(), z.number()]),
    item_part: z.string(),
    laying_planning_id: z.union([z.string(), z.number()]),
}).transform((data) => ({
    // Transform ke camelCase di sini
    id: data.id,
    itemPart: data.item_part,
    layingPlanningId: data.laying_planning_id,
}));

export type GroupParts = z.output<typeof GroupPartsApiSchema>;



export interface PartItem {
    id: string | number
    item_part: string
    lot_code?: string
    laying_planning_id?: string
}