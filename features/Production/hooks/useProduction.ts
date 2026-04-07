'use client';

import { useEffect, useState } from 'react';
import { ProductionService } from '../services/ProductionService';

export const useProduction = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchProductions = async () => {
        setIsLoading(true);
        try {
            const result = await ProductionService.getAll();
            if (result.status === 'success') {
                setData(result.data.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductions();
    }, []);

    return {
        data,
        isLoading,
        error,
        setData,
        refresh: fetchProductions
    };
};
