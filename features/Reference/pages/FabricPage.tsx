'use client';

import { PageHeader } from '@/app/components/ui/PageHeader';
import { FabricReference } from '../components/FabricReference';

const FabricPageContent = () => {
    return (
        <div className="flex flex-col flex-1">
            <PageHeader
                title="Fabric Management"
                breadcrumbItems={[
                    { label: 'Master Data', href: '#' },
                    { label: 'Fabrics' }
                ]}
            />
            <div className="flex-1 overflow-y-auto">
                <FabricReference />
            </div>
        </div>
    );
};

export default FabricPageContent;
