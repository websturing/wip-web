'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductivityService } from '../services/ProductivityService';
import { ProductionService } from '../../Production/services/ProductionService';
import { ProductivityLog } from '../types';

export const useProductivity = (options: { date?: string } = {}) => {
    const [data, setData] = useState<ProductivityLog[]>([]);
    const [productionData, setProductionData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!options.date) return;
        setIsLoading(true);
        setError(null);
        try {
            const [prodRes, outputRes] = await Promise.all([
                ProductivityService.getAll(options.date),
                ProductionService.getAll(options.date)
            ]);

            if (prodRes.status === 'success') {
                setData(prodRes.data || []);
            } else {
                throw new Error(prodRes.message || 'Failed to fetch productivity logs');
            }

            if (outputRes.status === 'success') {
                setProductionData(outputRes.data || []);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
        } finally {
            setIsLoading(false);
        }
    }, [options.date]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const deleteLog = async (id: string | number) => {
        setIsLoading(true);
        try {
            const res = await ProductivityService.delete(String(id));
            if (res.status === 'success') {
                setData(prev => prev.filter(item => String(item.id) !== String(id)));
                return true;
            } else {
                throw new Error(res.message || 'Failed to delete log');
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred during deletion'));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const exportDaily = async (date: string, lineIds?: string[], type: string = 'productivity') => {
        try {
            await ProductivityService.exportDailyReport(date, lineIds, type);
            return true;
        } catch (err) {
            console.error('Failed to export daily report:', err);
            return false;
        }
    };

    return {
        data,
        productionData,
        isLoading,
        error,
        setData,
        refresh: fetchData,
        deleteLog,
        exportDaily
    };
};
