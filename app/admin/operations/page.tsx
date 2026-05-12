import OperationListPage from '@/features/IeLayout/pages/OperationListPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Operation List | Industrial Engineering',
};

export default function Page() {
    return <OperationListPage />;
}
