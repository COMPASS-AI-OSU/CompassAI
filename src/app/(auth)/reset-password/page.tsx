import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { ResetPasswordForm } from '@/components/auth/PasswordForms';

export const metadata: Metadata = { title: 'Set a new password · CompassAI' };

// Logged-out visitors are sent to sign in by the proxy, and the save action
// checks the session again on the server.
export default function ResetPasswordPage() {
  return (
    <AuthShell title="Set a new password">
      <ResetPasswordForm />
    </AuthShell>
  );
}
