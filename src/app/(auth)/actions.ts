'use server';

import { createHash, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser, safeNextPath } from '@/lib/auth';

export type Field = 'email' | 'password' | 'confirm' | 'code';

export interface FormState {
  /** Problem with the whole form, shown at the top. */
  error?: string;
  /** Problem with one field, shown under that field. */
  fieldErrors?: Partial<Record<Field, string>>;
  /** Set when the form worked and the page should show a success message. */
  success?: 'reset-sent';
  /** Values to put back in the form after an error. Never the password. */
  values?: { email?: string; instructor?: boolean };
}

const EMAIL_MAX = 254;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // Supabase's password limit
const CODE_MAX = 100;

// ---------- helpers ----------

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

function checkEmail(email: string, osuOnly: boolean): string | undefined {
  if (!email) return 'Enter your email.';
  if (email.length > EMAIL_MAX) return `Email can be at most ${EMAIL_MAX} characters.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter an email like name.1@osu.edu.';
  if (osuOnly && !email.endsWith('@osu.edu')) return 'Use your @osu.edu email. Other emails can’t create an account.';
  return undefined;
}

function checkNewPassword(password: string): string | undefined {
  if (!password) return 'Enter a password.';
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Use at most ${PASSWORD_MAX} characters.`;
  return undefined;
}

/** Compares the code with the team's code without leaking it through timing. */
function isInstructorCode(code: string): boolean {
  const expected = process.env.INSTRUCTOR_SIGNUP_CODE;
  if (!expected || !code) return false;
  const normalize = (s: string) => createHash('sha256').update(s.trim().toUpperCase()).digest();
  return timingSafeEqual(normalize(code), normalize(expected));
}

function checkCode(instructor: boolean, code: string): string | undefined {
  if (!instructor) return undefined;
  if (!code.trim()) return 'Enter the instructor code from the CompassAI team, or turn off “I’m an instructor.”';
  if (code.length > CODE_MAX || !isInstructorCode(code)) {
    return 'That instructor code isn’t right. Check it with the CompassAI team, or turn off “I’m an instructor.”';
  }
  return undefined;
}

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin');
  if (origin) return origin;
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function friendlyAuthError(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'That email and password don’t match an account. Check them, or create an account.';
    case 'email_not_confirmed':
      return 'Confirm your email first. Open the link we sent you, then sign in.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many tries in a short time. Wait a few minutes, then try again.';
    case 'weak_password':
      return 'That password is too easy to guess. Try a longer one.';
    case 'same_password':
      return 'Your new password must be different from your old one.';
    case 'signup_disabled':
      return 'New accounts are turned off right now. Ask the CompassAI team.';
    default:
      return fallback;
  }
}

async function makeInstructor(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'instructor' },
  });
  return !error;
}

// ---------- actions ----------

export async function signIn(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = text(formData, 'email').trim().toLowerCase();
  const password = text(formData, 'password');
  const instructor = formData.get('instructor') === 'on';
  const code = text(formData, 'code');
  const values = { email, instructor };

  const fieldErrors: FormState['fieldErrors'] = {
    email: checkEmail(email, false),
    password: password ? undefined : 'Enter your password.',
    code: checkCode(instructor, code),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: friendlyAuthError(error?.code, 'We couldn’t sign you in. Try again in a moment.'), values };
  }

  let role = data.user.app_metadata?.role === 'instructor' ? 'instructor' : 'student';

  // A correct instructor code upgrades the account, then refreshes the
  // session so the new role is in the sign-in token.
  if (instructor && role !== 'instructor') {
    if (!(await makeInstructor(data.user.id))) {
      await supabase.auth.signOut();
      return { error: 'Your code is right, but we couldn’t turn on instructor access. Try again, or contact the CompassAI team.', values };
    }
    await supabase.auth.refreshSession();
    role = 'instructor';
  }

  const next = safeNextPath(text(formData, 'next'));
  redirect(next ?? (role === 'instructor' ? '/instructor' : '/'));
}

export async function signUp(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = text(formData, 'email').trim().toLowerCase();
  const password = text(formData, 'password');
  const instructor = formData.get('instructor') === 'on';
  const code = text(formData, 'code');
  const values = { email, instructor };

  const fieldErrors: FormState['fieldErrors'] = {
    email: checkEmail(email, true),
    password: checkNewPassword(password),
    code: checkCode(instructor, code),
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors, values };

  // No confirmation email at this stage: the server creates the account
  // already confirmed. Supabase stores only a hash of the password, never the
  // password itself. The role is set here, on the server, in app_metadata.
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: instructor ? { role: 'instructor' } : {},
  });
  if (createError) {
    if (createError.code === 'email_exists' || createError.code === 'user_already_exists') {
      return { fieldErrors: { email: 'There’s already an account with this email. Sign in instead, or use Forgot password.' }, values };
    }
    return { error: friendlyAuthError(createError.code, 'We couldn’t create your account. Try again in a moment.'), values };
  }

  // Sign the new account straight in.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { error: 'Your account was created, but we couldn’t sign you in. Try signing in.', values };
  }

  const next = safeNextPath(text(formData, 'next'));
  redirect(next ?? (instructor ? '/instructor' : '/'));
}

export async function requestPasswordReset(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const email = text(formData, 'email').trim().toLowerCase();
  const emailError = checkEmail(email, false);
  if (emailError) return { fieldErrors: { email: emailError }, values: { email } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });
  if (error && (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit')) {
    return { error: friendlyAuthError(error.code, ''), values: { email } };
  }

  // Same message whether or not the account exists, so this page can't be
  // used to find out who has an account.
  return { success: 'reset-sent', values: { email } };
}

export async function updatePassword(_prev: FormState | undefined, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?error=link');

  const password = text(formData, 'password');
  const confirm = text(formData, 'confirm');
  const fieldErrors: FormState['fieldErrors'] = {
    password: checkNewPassword(password),
    confirm: confirm ? (confirm === password ? undefined : 'The two passwords don’t match.') : 'Enter the password again.',
  };
  if (Object.values(fieldErrors).some(Boolean)) return { fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: friendlyAuthError(error.code, 'We couldn’t change your password. Try again in a moment.') };
  }

  redirect(user.role === 'instructor' ? '/instructor' : '/');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in?signed-out=1');
}
