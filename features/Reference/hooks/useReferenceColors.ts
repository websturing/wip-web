'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReferenceColors = () => {
    const [colors, setColors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(50);

    // Search state
    const [search, setSearch] = useState('');

    const fetchColors = async (page: number = 1, searchQuery: string = search) => {
        setIsLoading(true);
        setCurrentPage(page);
        setSearch(searchQuery);
        try {
            const result = await ReferenceService.getColors(page, searchQuery);
            if (result.status === 'success') {
                setColors(result.data.data || []);
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
        fetchColors(1, search);
    }, []);

    return {
        colors,
        isLoading,
        error,
        currentPage,
        total,
        perPage,
        search,
        refresh: () => fetchColors(currentPage, search),
        setPage: (page: number) => fetchColors(page, search),
        setSearch: (query: string) => fetchColors(1, query)
    };
};
