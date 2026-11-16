import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { cleanVariant, HEADLINE_COOKIE } from '@/lib/experiment';
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
  if (user) return <AppHome user={user} />;
  // Headline experiment (#57): src/proxy.ts picks the version; A if cookies are blocked.
  const variant = cleanVariant((await cookies()).get(HEADLINE_COOKIE)?.value) ?? 'a';
  return <LandingPage variant={variant} />;
}
