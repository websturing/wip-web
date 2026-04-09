import { ProductivityFormPage } from '@/features/productivity';

export const metadata = {
    title: 'New Performance Log - Admin',
    description: 'Entry point for daily productivity metrics.',
};

export default function CreateProductivityPage() {
    return <ProductivityFormPage />;
}
