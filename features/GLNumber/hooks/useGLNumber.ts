'use client';

import { useState, useEffect } from 'react';

export const useGLNumber = () => {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Fetch initialization if needed
    }, []);

    return {
        data,
        isLoading,
        error,
        setData
    };
};
