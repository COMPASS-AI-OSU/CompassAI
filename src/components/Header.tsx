import React from 'react';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { CompassMark } from './auth/AuthShell';
import { SessionUser } from '../types';
import { signOut } from '@/app/(auth)/actions';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  /** Not shown here anymore: the step bar under the header shows where you are. */
  currentScreen: 1 | 2 | 3;
  onNavigateScreen: (screen: 1 | 2 | 3) => void;
  user: SessionUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateScreen,
  user,
}) => {
  return (
    <header className="w-full bg-neutral-50/90 backdrop-blur-sm text-neutral-900 border-b border-neutral-300 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Ohio State CompassAI wordmark */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateScreen(1)}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] rounded-md p-1 -m-1"
            title="Return to CompassAI Courses"
          >
            <CompassMark className="w-8 h-8 transition-transform group-hover:rotate-45" />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold font-serif tracking-tight text-neutral-950">Compass</span>
                <span className="text-xs font-bold text-[#BA0C2F]">AI</span>
              </div>
              <span className="hidden sm:block -mt-0.5 text-[11px] text-neutral-600">Ohio State · Syllabus guide</span>
            </div>
          </button>
        </div>

        {/* Zone 3: Night mode, then the signed-in person or a Sign in link */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'instructor' && (
                <Link
                  href="/instructor"
                  className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#BA0C2F] hover:bg-[#990000] text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
                >
                  Instructor dashboard
                </Link>
              )}
              <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-neutral-300 bg-white">
                <div
                  className="w-6 h-6 rounded-full bg-[#BA0C2F] text-white flex items-center justify-center font-bold text-xs"
                  aria-hidden="true"
                >
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-neutral-900 max-w-[180px] truncate">
                  {user.email}
                </span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-400 text-xs font-semibold text-neutral-800 hover:bg-neutral-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F]"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#BA0C2F] hover:bg-[#990000] text-white text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] focus-visible:ring-offset-2"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
