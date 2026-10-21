import React from 'react';
import { Compass, Smartphone, Monitor } from 'lucide-react';
import { StudentProfile } from '../types';

interface HeaderProps {
  currentScreen: 1 | 2 | 3;
  onNavigateScreen: (screen: 1 | 2 | 3) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  studentProfiles: StudentProfile[];
  currentStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigateScreen,
  isMobileFrame,
  setIsMobileFrame,
  studentProfiles,
  currentStudent,
  onSelectStudent,
}) => {
  return (
    <header className="w-full bg-neutral-950 text-white border-b-2 border-b-[#BA0C2F] sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Ohio State CompassAI wordmark */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateScreen(1)}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BA0C2F] rounded-md p-1 -m-1"
            title="Return to CompassAI Courses"
          >
            <div className="w-8 h-8 rounded-lg bg-[#BA0C2F] text-white flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-5 h-5 text-white transition-transform group-hover:rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                  CompassAI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#BA0C2F] text-white px-1.5 py-0.2 rounded font-mono">
                  OSU
                </span>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-normal text-neutral-400">
                The Ohio State University · Syllabus Guide
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Screen indicators / links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-neutral-300">
          <button
            onClick={() => onNavigateScreen(1)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentScreen === 1
                ? 'bg-[#BA0C2F] text-white font-bold'
                : 'hover:text-white hover:bg-neutral-800'
            }`}
          >
            1. OSU Courses
          </button>
          <span className="text-neutral-600">/</span>
          <button
            onClick={() => onNavigateScreen(2)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentScreen === 2
                ? 'bg-[#BA0C2F] text-white font-bold'
                : 'hover:text-white hover:bg-neutral-800'
            }`}
          >
            2. Policy Table
          </button>
          <span className="text-neutral-600">/</span>
          <button
            onClick={() => onNavigateScreen(3)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              currentScreen === 3
                ? 'bg-[#BA0C2F] text-white font-bold'
                : 'hover:text-white hover:bg-neutral-800'
            }`}
          >
            3. Compass Chat
          </button>
        </nav>

        {/* Zone 3: Actions (Mobile frame toggle + Student persona selector) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Device Viewport Toggle (for desktop testers) */}
          <div className="hidden lg:flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-700">
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                isMobileFrame
                  ? 'bg-[#BA0C2F] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Preview in 390px Mobile Viewport"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                !isMobileFrame
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Preview in Fluid Desktop Layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Laptop</span>
            </button>
          </div>

          {/* Student Profile Switcher */}
          <div className="relative group">
            <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#BA0C2F] text-white flex items-center justify-center font-bold text-xs">
                {currentStudent.name.charAt(0)}
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-white block leading-tight">
                  {currentStudent.name}
                </span>
                <span className="text-[10px] text-neutral-400 block leading-none font-mono">
                  {currentStudent.email.split('@')[0]}
                </span>
              </div>
              <select
                aria-label="Switch Student Profile"
                value={currentStudent.id}
                onChange={(e) => {
                  const found = studentProfiles.find((s) => s.id === e.target.value);
                  if (found) onSelectStudent(found);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {studentProfiles.map((sp) => (
                  <option key={sp.id} value={sp.id} className="text-black bg-white">
                    {sp.name} ({sp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
