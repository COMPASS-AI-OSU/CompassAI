import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { CredentialsForm } from '@/components/auth/CredentialsForm';
import { FormSkeleton } from '@/components/auth/fields';

export const metadata: Metadata = { title: 'Sign in · CompassAI' };

export default function SignInPage() {
  return (
    <AuthShell title="Sign in" intro="Sign in to ask Compass about your course’s AI rules.">
      <Suspense fallback={<FormSkeleton />}>
        <CredentialsForm mode="sign-in" />
      </Suspense>
    </AuthShell>
  );
}
