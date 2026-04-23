'use client';

import { BreadcrumbItem } from '@/app/components/ui/Breadcrumb';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { ProfileView } from '../components/ProfileView';

export default function ProfilePage() {
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin', icon: 'solar:home-2-bold-duotone' },
        { label: 'My Account', icon: 'solar:user-bold-duotone' },
    ];

    return (
        <div className="animate-in fade-in duration-700">
            <PageHeader
                items={breadcrumbItems}
                title="Profile Settings"
                subtitle="Account Management"
                description="Manage your personal information and security settings."
            />

            <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden mb-20 animate-in slide-in-from-bottom-6 duration-1000">
                <ProfileView />
            </div>
        </div>
    );
}
