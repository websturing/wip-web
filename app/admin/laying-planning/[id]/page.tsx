import DetailLayingPlanningPage from '@/features/LayingPlanning/pages/DetailLayingPlanningPage';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <DetailLayingPlanningPage id={resolvedParams.id} />;
}
