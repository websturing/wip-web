'use client';

import { useEffect, useState } from 'react';
import { LineService } from '../services/LineService';

export const useLines = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchLines = async () => {
        setIsLoading(true);
        try {
            const result = await LineService.getAll();
            if (result.status === 'success') {
                // Backend is paginated return Line::paginate: { current_page, data, ... }
                setData(result.data.data || result.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLines();
    }, []);

    return {
        data,
        isLoading,
        error,
        setData,
        refresh: fetchLines
    };
};
