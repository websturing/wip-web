'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReferenceSizes = () => {
    const [sizes, setSizes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchSizes = async () => {
        setIsLoading(true);
        try {
            const result = await ReferenceService.getSizes();
            if (result.status === 'success') {
                const responseData = result.data;
                const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
                setSizes(items);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSizes();
    }, []);

    return {
        sizes,
        isLoading,
        error,
        refresh: fetchSizes
    };
};
