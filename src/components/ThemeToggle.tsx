'use client';

import React, { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'compass-theme';
const EVENT = 'compass-theme-change';
type Theme = 'light' | 'dark';

function savedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  // Follow the device setting until someone picks a theme with the button.
  const onDevice = () => {
    if (!savedTheme()) apply(media.matches ? 'dark' : 'light');
  };
  window.addEventListener(EVENT, onChange);
  media.addEventListener('change', onDevice);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener('change', onDevice);
  };
}

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** Sun/moon button: switches night mode and remembers the choice in this browser. */
export function ThemeToggle({ onDark = false }: { onDark?: boolean }) {
  const theme = useSyncExternalStore(subscribe, current, () => 'light' as Theme);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const toggle = () => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private window or blocked storage: still switch for this visit.
    }
    apply(next);
  };

  const label = next === 'dark' ? 'Switch to night mode' : 'Switch to day mode';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer focus:outline-none focus-visible:ring-2 ${
        onDark
          ? 'border-neutral-600 text-neutral-200 hover:bg-neutral-800 focus-visible:ring-white'
          : 'border-neutral-400 text-neutral-800 hover:bg-neutral-200 focus-visible:ring-[#BA0C2F]'
      }`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
