'use client';

import { useEffect, useState } from 'react';

export const useAppName = () => {
    const [mounted, setMounted] = useState(false);
    const [appName, setAppName] = useState({ prefix: 'WIP', suffix: 'Apps' });

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const prefix = hostname.split('.')[0];
            setAppName({ prefix: prefix, suffix: 'WIP' });
        }
    }, []);

    return { ...appName, mounted };
};
