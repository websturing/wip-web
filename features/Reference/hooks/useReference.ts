'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReference = () => {
    const [lots, setLots] = useState<any[]>([]);
    const [lastImport, setLastImport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchLots = async () => {
        setIsLoading(true);
        try {
            const result = await ReferenceService.getLots();
            if (result.status === 'success') {
                setLots(result.data.data || []);
                setLastImport(result.meta?.last_import || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLots();
    }, []);

    return {
        lots,
        lastImport,
        isLoading,
        error,
        refresh: fetchLots
    };
};
