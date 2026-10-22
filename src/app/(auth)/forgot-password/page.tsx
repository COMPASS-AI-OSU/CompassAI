import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/auth/PasswordForms';

export const metadata: Metadata = { title: 'Forgot password · CompassAI' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot password" intro="Enter your email and we’ll send you a link to set a new password.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
