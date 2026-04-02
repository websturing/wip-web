import { IeLayoutList } from '@/features/IeLayout/components/IeLayoutList';

export const metadata = {
    title: 'IE Layouts - Management',
    description: 'Manage production layout time studies and operations effectively.',
};

export default function IeLayoutPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-12">
            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight uppercase">
                        IE <span className="text-blue-600 tracking-widest italic">Layouts</span>
                    </h1>
                    <p className="mt-2 text-zinc-500 font-medium">
                        Production Performance Analytics & Industrial Engineering
                    </p>
                </div>

                <button className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/10">
                    Add New Layout
                </button>
            </header>

            <section className="max-w-7xl mx-auto">
                <IeLayoutList />
            </section>
        </main>
    );
}
