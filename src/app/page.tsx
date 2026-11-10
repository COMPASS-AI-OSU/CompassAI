import { Suspense } from 'react';
import { AppHome, AppLoading } from '@/components/AppHome';
import { LandingPage } from '@/components/LandingPage';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  return (
    <Suspense fallback={<AppLoading />}>
      <HomeContent />
    </Suspense>
  );
}

/** Signed in: straight to the app. Not signed in: the landing page (what it is, who it's for, sign up). */
async function HomeContent() {
  const user = await getCurrentUser();
  return user ? <AppHome user={user} /> : <LandingPage />;
}
