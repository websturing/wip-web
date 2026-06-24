import { useState, useEffect } from 'react';
import { LayingPlanningService } from '../services/LayingPlanningService';

export const useLayingPlanning = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [perPage, setPerPage] = useState(20);

    const fetchData = async (page: number = 1) => {
        setIsLoading(true);
        setCurrentPage(page);
        try {
            // Suppose LayingPlanningService.getAll supports page parameter
            // If not, it just fetches the first page, but we'll pass page anyway
            const response = await LayingPlanningService.getAll(page);
            const resData = response.data;
            
            if (resData && !Array.isArray(resData) && Array.isArray(resData.data)) {
                setData(resData.data);
                setTotal(resData.total || 0);
                setPerPage(resData.per_page || 20);
                setCurrentPage(resData.current_page || page);
            } else {
                setData(resData || []);
            }
            setError(null);
        } catch (err: any) {
            setError(err);
            console.error('Failed to load laying planning data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    return {
        data,
        isLoading,
        error,
        setData,
        currentPage,
        total,
        perPage,
        setPage: fetchData,
        refetch: () => fetchData(currentPage)
    };
};
