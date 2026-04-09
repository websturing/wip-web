'use client';

import { useEffect, useState } from 'react';
import { IeLayoutService } from '../services/IeLayoutService';
import { IeLayout } from '../types';

export const useIeLayout = () => {
    const [data, setData] = useState<IeLayout[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await IeLayoutService.getAll();
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteLayout = async (id: number) => {
        try {
            await IeLayoutService.delete(id);
            setData(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return {
        data,
        isLoading,
        error,
        fetchData,
        refresh: fetchData,
        deleteLayout
    };
}
