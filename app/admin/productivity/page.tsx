import { Productivity } from '@/features/productivity';
import { Suspense } from 'react';

export const metadata = {
    title: 'Productivity Tracking - Admin',
    description: 'Monitor and optimize daily production efficiency.',
};

export default function ProductivityPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        }>
            <Productivity />
        </Suspense>
    );
}
