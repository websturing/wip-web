'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { ProfileView } from '../components/ProfileView';

export default function ProfilePage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'My Account', icon: 'solar:user-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <div className="overflow-hidden mb-20 animate-in slide-in-from-bottom-6 duration-1000">
                <ProfileView />
            </div>
        </div>
    );
}
