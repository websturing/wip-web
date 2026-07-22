import { GroupPartsApiSchema, PartsApiSchema, SizeItem } from '@/features/LayingPlanning/types';
import { useEffect, useMemo, useState } from 'react';
import { LayingPlanningService } from '../services/LayingPlanningService';

const normalizePart = (item: any) => {
    if (!item) return item;
    if ('itemPart' in item || 'layingPlanningId' in item || 'itemPartGroupCode' in item) {
        return item;
    }

    const parsed = PartsApiSchema.safeParse(item);
    return parsed.success ? parsed.data : item;
};

const normalizeGroupPart = (item: any) => {
    if (!item) return item;
    if ('itemPart' in item || 'layingPlanningId' in item) {
        return item;
    }

    const parsed = GroupPartsApiSchema.safeParse(item);
    return parsed.success ? parsed.data : item;
};

const normalizeDetailPayload = (payload: any) => {
    if (!payload) return payload;

    return {
        ...payload,
        parts: Array.isArray(payload.parts) ? payload.parts.map(normalizePart) : payload.parts,
        group_parts: Array.isArray(payload.group_parts) ? payload.group_parts.map(normalizeGroupPart) : payload.group_parts,
    };
};

export const useLayingPlanningDetail = (id: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDetail = async () => {
        if (!id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await LayingPlanningService.getById(id);
            const payload = response?.data ?? response;
            setData(normalizeDetailPayload(payload));
            setError(null);
        } catch (err: any) {
            setError(err);
            console.error('Failed to load laying planning details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const { sizes, totalQty, totalCutMap, parts, groupParts } = useMemo(() => {
        // A. Ekstrak data sizes dari details (sesuaikan dengan struktur response API Anda)
        // Misal asumsinya details langsung berisi list SizeItem
        const computedSizes: SizeItem[] = data?.sizes || [];

        // B. Hitung total qty order
        const computedTotalQty = computedSizes.reduce((sum, item) => sum + (item.order_qty || 0), 0);

        // C. Hitung mapping total cut per size
        // Anda bisa sesuaikan rumus pengisian totalCutMap ini dari object details Anda
        const computedTotalCutMap: Record<string, number> = {};
        computedSizes.forEach((item) => {
            const key = String(item.size_id || item.id);
            // Misal: ambil dari property total_cut yang datang dari API, atau hitung manual
            computedTotalCutMap[key] = (item as any).total_cut || 0;
        });

        const computedParts = (data?.parts || []).map(normalizePart);
        const computedIsGroupParts = (data?.group_parts || []).map(normalizeGroupPart);

        return {
            sizes: computedSizes,
            totalQty: computedTotalQty,
            totalCutMap: computedTotalCutMap,
            parts: computedParts,
            groupParts: computedIsGroupParts
        };
    }, [data]);


    useEffect(() => {
        fetchDetail();
    }, [id]);

    return {
        data,
        isLoading,
        error,
        sizes,          // <--- Siap pakai
        totalQty,       // <--- Siap pakai
        totalCutMap,
        parts,
        groupParts,
        refetch: fetchDetail
    };
};
