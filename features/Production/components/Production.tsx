'use client';

import { useProduction } from '../hooks/useProduction';

export const Production = () => {
    const { data, isLoading } = useProduction();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Production
            </h2>
            <div className="mt-4">
                {/* Content Here */}
                <p className="text-zinc-500">Feature: Production</p>
            </div>
        </div>
    );
};
