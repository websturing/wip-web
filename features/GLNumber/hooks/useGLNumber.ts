'use client';

import { useState, useEffect, useCallback } from 'react';
import { GLNumberService } from '../services/GLNumberService';
import { GlGroup } from '../types';

export const useGLNumber = () => {
    const [data, setData] = useState<GlGroup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [search, setSearch] = useState('');
    const [total, setTotal] = useState(0);

    const fetchGLNumbers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await GLNumberService.getAll(page, perPage, search);
            setData(response.data.data);
            setTotal(response.data.total);
            setError(null);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGLNumbers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchGLNumbers]);

    return {
        data,
        isLoading,
        error,
        page,
        perPage,
        search,
        total,
        setPage,
        setPerPage,
        setSearch,
        refresh: fetchGLNumbers
    };
};
