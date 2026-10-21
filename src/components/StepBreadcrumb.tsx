import React from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';

interface StepBreadcrumbProps {
  currentScreen: 1 | 2 | 3;
  onBack?: () => void;
  backLabel?: string;
  courseCode?: string;
  assignmentTitle?: string;
}

export const StepBreadcrumb: React.FC<StepBreadcrumbProps> = ({
  currentScreen,
  onBack,
  backLabel = 'Back',
}) => {
  return (
    <div className="w-full bg-neutral-200/90 border-b border-neutral-300 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
        {/* Back button when on screen 2 or 3 */}
        {currentScreen > 1 && onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-[#BA0C2F] bg-white border border-neutral-300 hover:border-[#BA0C2F] rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs cursor-pointer min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#BA0C2F]" />
            <span>{backLabel}</span>
          </button>
        ) : (
          <div className="text-[11px] font-bold tracking-wider text-neutral-600 uppercase">
            Ohio State Carmen · Step 1 of 3
          </div>
        )}

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
              currentScreen === 1
                ? 'bg-[#BA0C2F] text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {currentScreen > 1 ? <Check className="w-3 h-3 text-[#BA0C2F]" /> : '1.'}
            <span>Courses</span>
          </span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
              currentScreen === 2
                ? 'bg-[#BA0C2F] text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {currentScreen > 2 ? <Check className="w-3 h-3 text-[#BA0C2F]" /> : '2.'}
            <span>Policy Table</span>
          </span>
          <ChevronRight className="w-3 h-3 text-neutral-400" />

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
              currentScreen === 3
                ? 'bg-[#BA0C2F] text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            3.
            <span>Compass Chat</span>
          </span>
        </div>
      </div>
    </div>
  );
};
