'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReference = () => {
    const [lots, setLots] = useState<any[]>([]);
    const [lastImport, setLastImport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(50);

    // Search state
    const [search, setSearch] = useState('');

    const fetchLots = async (page: number = 1, searchQuery: string = search) => {
        setIsLoading(true);
        setCurrentPage(page);
        setSearch(searchQuery);
        try {
            const result = await ReferenceService.getLots(page, searchQuery);
            if (result.status === 'success') {
                setLots(result.data.data || []);
                setTotal(result.data.total || 0);
                setPerPage(result.data.per_page || 50);
                setLastImport(result.meta?.last_import || null);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLots(1, search);
    }, []);

    return {
        lots,
        lastImport,
        isLoading,
        error,
        currentPage,
        total,
        perPage,
        search,
        refresh: () => fetchLots(currentPage, search),
        setPage: (page: number) => fetchLots(page, search),
        setSearch: (query: string) => fetchLots(1, query)
    };
};
