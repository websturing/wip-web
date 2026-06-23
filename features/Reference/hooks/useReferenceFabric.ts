'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReferenceFabric = () => {
    const [fabrics, setFabrics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(50);

    // Search state
    const [search, setSearch] = useState('');

    const fetchFabrics = async (page: number = 1, searchQuery: string = search) => {
        setIsLoading(true);
        setCurrentPage(page);
        setSearch(searchQuery);
        try {
            const result = await ReferenceService.getFabrics(page, searchQuery);
            if (result.status === 'success') {
                setFabrics(result.data.data || []);
                setTotal(result.data.total || 0);
                setPerPage(result.data.per_page || 50);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFabrics(1, search);
    }, []);

    return {
        fabrics,
        isLoading,
        error,
        currentPage,
        total,
        perPage,
        search,
        refresh: () => fetchFabrics(currentPage, search),
        setPage: (page: number) => fetchFabrics(page, search),
        setSearch: (query: string) => fetchFabrics(1, query)
    };
};
