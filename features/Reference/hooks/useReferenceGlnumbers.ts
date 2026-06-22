'use client';

import { useEffect, useState } from 'react';
import { ReferenceService } from '../services/ReferenceService';

export const useReferenceGlnumbers = () => {
    const [glnumbers, setGlnumbers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(50);

    // Search state
    const [search, setSearch] = useState('');

    const fetchGlnumbers = async (page: number = 1, searchQuery: string = search) => {
        setIsLoading(true);
        setCurrentPage(page);
        setSearch(searchQuery);
        try {
            const result = await ReferenceService.getGlnumbers(page, searchQuery);
            if (result.status === 'success') {
                // Handle both paginated response (result.data.data) and flat response (result.data)
                const dataArray = Array.isArray(result.data) ? result.data : (result.data.data || []);
                setGlnumbers(dataArray);
                setTotal(result.data.total || dataArray.length);
                setPerPage(result.data.per_page || dataArray.length);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    };



    useEffect(() => {
        fetchGlnumbers(1, search);
    }, []);

    const glOptions = glnumbers.map((gl: any) => ({
        id: gl.id.toString(),
        label: `${gl.name}`
    }));

    return {
        glnumbers,
        glOptions, // <-- Return the mapped options here
        isLoading,
        error,
        currentPage,
        total,
        perPage,
        search,
        refresh: () => fetchGlnumbers(currentPage, search),
        setPage: (page: number) => fetchGlnumbers(page, search),
        setSearch: (query: string) => fetchGlnumbers(1, query)
    };
};
