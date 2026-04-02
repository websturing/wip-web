'use client';

import { useIeLayout } from '../hooks/useIeLayout';

export const IeLayoutList = () => {
    const { data, isLoading, error, deleteLayout } = useIeLayout();

    if (isLoading) return <div className="text-center font-medium">Loading Layouts...</div>;
    if (error) return <div className="text-red-500 font-medium">Error: {error.message}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.length > 0 ? (
                data.map((layout) => (
                    <div
                        key={layout.id}
                        className="group relative p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-2xl hover:scale-[1.02]"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                                    {layout.name}
                                </h3>
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                    {layout.department}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-black rounded-full">
                                ID: {layout.id}
                            </span>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Price</span>
                                <span className="font-bold text-green-600">${layout.price}</span>
                            </div>
                            {layout.is_gl_number && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium tracking-wide">GL Number</span>
                                    <span className="font-bold font-mono bg-zinc-100 dark:bg-zinc-800 px-2 rounded">
                                        {layout.gl_number}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="flex-1 py-2 text-xs font-bold uppercase tracking-widest bg-blue-600 text-white rounded-xl active:scale-95 transition-transform">
                                Detail
                            </button>
                            <button
                                onClick={() => deleteLayout(layout.id)}
                                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 bg-red-100 dark:bg-red-900/30 rounded-xl hover:bg-red-200 active:scale-95 transition-transform"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full p-20 bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
                    <p className="text-zinc-400 font-medium">No IE Layouts found.</p>
                </div>
            )}
        </div>
    );
};
