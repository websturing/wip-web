'use client';

import { useEffect, useState } from 'react';
import { PackingService } from '../services/PackingService';

export const usePacking = (options: { date?: string } = {}) => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchPackings = async () => {
        setIsLoading(true);
        try {
            const result = await PackingService.getAll(options.date);
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
        fetchPackings();
    }, [options.date]);

    return {
        data,
        isLoading,
        error,
        setData,
        refresh: fetchPackings
    };
};
