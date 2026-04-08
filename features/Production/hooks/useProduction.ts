'use client';

import { useEffect, useState } from 'react';
import { ProductionService } from '../services/ProductionService';

export const useProduction = (options: { date?: string } = {}) => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchProductions = async () => {
        setIsLoading(true);
        try {
            const result = await ProductionService.getAll(options.date);
            if (result.status === 'success') {
                setData(result.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductions();
    }, [options.date]);

    return {
        data,
        isLoading,
        error,
        setData,
        refresh: fetchProductions
    };
};
