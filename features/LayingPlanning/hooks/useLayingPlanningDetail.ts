import { useState, useEffect } from 'react';
import { LayingPlanningService } from '../services/LayingPlanningService';

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
            setData(response.data || response);
            setError(null);
        } catch (err: any) {
            setError(err);
            console.error('Failed to load laying planning details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchDetail
    };
};
