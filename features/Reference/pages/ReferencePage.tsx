'use client';

import { PageHeader } from '@/app/components/ui/PageHeader';
import { Reference } from '../components/Reference';

const ReferencePageContent = () => {
    return (
        <div className="flex flex-col flex-1">
            <PageHeader
                title="Reference Center"
                breadcrumbItems={[
                    { label: 'Master Data', href: '#' },
                    { label: 'Garment Reference', active: true }
                ]}
            />
            <div className="flex-1 overflow-y-auto">
                <Reference />
            </div>
        </div>
    );
};

export default ReferencePageContent;
