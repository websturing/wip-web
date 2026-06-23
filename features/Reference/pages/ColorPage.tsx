'use client';

import { PageHeader } from '@/app/components/ui/PageHeader';
import { ColorReference } from '../components/ColorReference';

const ColorPageContent = () => {
    return (
        <div className="flex flex-col flex-1">
            <PageHeader
                title="Color Management"
                breadcrumbItems={[
                    { label: 'Master Data', href: '#' },
                    { label: 'Colors' }
                ]}
            />
            <div className="flex-1 overflow-y-auto">
                <ColorReference />
            </div>
        </div>
    );
};

export default ColorPageContent;
