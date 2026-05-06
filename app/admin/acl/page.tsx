import { AclPage } from "@/features/Acl/pages/AclPage";
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        }>
            <AclPage />
        </Suspense>
    );
}
