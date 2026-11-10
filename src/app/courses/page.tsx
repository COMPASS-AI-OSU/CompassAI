import { Suspense } from 'react';
import { AppHome, AppLoading } from '@/components/AppHome';
import { getCurrentUser } from '@/lib/auth';

/**
 * The app without the landing page: logged-out visitors can still search published courses
 * and read their rules (roles table), from "Browse courses without an account".
 */
export default function CoursesPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <CoursesContent />
    </Suspense>
  );
}

async function CoursesContent() {
  return <AppHome user={await getCurrentUser()} />;
}
