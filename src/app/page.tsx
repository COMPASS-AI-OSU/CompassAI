import { Suspense } from 'react';
import CompassApp from '@/components/CompassApp';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const user = await getCurrentUser();
  return <CompassApp user={user} />;
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center" aria-busy="true">
      <p className="text-sm font-semibold text-neutral-700">Loading CompassAI…</p>
    </div>
  );
}
