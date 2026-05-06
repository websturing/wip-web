import { ProductivityFormPage } from '@/features/productivity';
import { Suspense } from 'react';

export const metadata = {
    title: 'New Performance Log - Admin',
    description: 'Entry point for daily productivity metrics.',
};

export default function CreateProductivityPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        }>
            <ProductivityFormPage />
        </Suspense>
    );
}
