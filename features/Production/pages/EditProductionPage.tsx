'use client';

import { useParams } from 'next/navigation';
import CreateProductionPage from './CreateProductionPage';

export default function EditProductionPage() {
    const params = useParams();
    const id = params.id as string;

    return <CreateProductionPage id={id} />;
}
