import { IeLayoutFormPage } from '@/features/IeLayout';

export const metadata = {
    title: 'Edit IE Layout - Admin',
    description: 'Refine and optimize production layout architecture.',
};

export const generateStaticParams = () => [];

export default function Page() {
    return <IeLayoutFormPage />;
}

