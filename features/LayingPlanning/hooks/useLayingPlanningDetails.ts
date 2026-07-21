import { useCallback, useEffect, useState } from 'react';
import { LayingPlanningService } from '../services/LayingPlanningService';




export const useLayingPlanningDetails = (lpId: string | number) => {
    const [details, setDetails] = useState<any[]>([]);
    const [detailTypes, setDetailTypes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!lpId) return;
        setIsLoading(true);
        try {
            const response = await LayingPlanningService.getDetails(lpId);
            if (response.status === 'success') {
                setDetails(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch     details');
            }
        } catch (err: any) {
            setError(err);
            console.error(err.message || 'Failed to load details');
        } finally {
            setIsLoading(false);
        }
    }, [lpId]);


    const fetchDetailTypes = useCallback(async () => {
        try {
            const response = await LayingPlanningService.getDetailTypes();
            if (response.status === 'success') {
                setDetailTypes(response.data.data || []);
            }
        } catch (err: any) {
            console.error('Failed to load detail types:', err);
        }
    }, []);

    useEffect(() => {
        if (lpId) {
            fetchDetails();
            fetchDetailTypes();
        }
    }, [lpId, fetchDetails, fetchDetailTypes]);

    const createDetail = async (payload: any) => {
        try {
            const response = await LayingPlanningService.createDetail(lpId, payload);
            if (response.status === 'success') {
                await fetchDetails();
                return true;
            }
            throw new Error(response.message || 'Failed to create detail');
        } catch (err: any) {
            console.error(err.message || 'Failed to create detail');
            return false;
        }
    };

    const updateDetail = async (detailId: string | number, payload: any) => {
        try {
            const response = await LayingPlanningService.updateDetail(lpId, detailId, payload);
            if (response.status === 'success') {
                await fetchDetails();
                return true;
            }
            throw new Error(response.message || 'Failed to update detail');
        } catch (err: any) {
            console.error(err.message || 'Failed to update detail');
            return false;
        }
    };

    const deleteDetail = async (detailId: string | number) => {
        try {
            const response = await LayingPlanningService.deleteDetail(lpId, detailId);
            if (response.status === 'success') {
                await fetchDetails();
                return true;
            }
            throw new Error(response.message || 'Failed to delete detail');
        } catch (err: any) {
            console.error(err.message || 'Failed to delete detail');
            return false;
        }
    };

    return {
        details,
        detailTypes,
        isLoading,
        error,
        refetch: fetchDetails,
        createDetail,
        updateDetail,
        deleteDetail
    };
};
