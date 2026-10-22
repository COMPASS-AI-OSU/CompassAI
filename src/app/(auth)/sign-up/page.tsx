import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { CredentialsForm } from '@/components/auth/CredentialsForm';
import { FormSkeleton } from '@/components/auth/fields';

export const metadata: Metadata = { title: 'Create account · CompassAI' };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create account"
      intro="We only ask for your OSU email and a password. You’ll be signed in right away."
    >
      <Suspense fallback={<FormSkeleton />}>
        <CredentialsForm mode="sign-up" />
      </Suspense>
    </AuthShell>
  );
}
