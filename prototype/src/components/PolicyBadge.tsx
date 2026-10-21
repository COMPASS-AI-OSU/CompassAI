import React from 'react';
import { AIPolicyStatus } from '../types';
import { Ban, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

interface PolicyBadgeProps {
  status: AIPolicyStatus;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PolicyBadge: React.FC<PolicyBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] py-1 px-2.5 gap-1.5 font-semibold',
    md: 'text-xs py-1.5 px-3 gap-1.5 font-semibold',
    lg: 'text-sm py-2 px-3.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  switch (status) {
    case 'strictly_prohibited':
      return (
        <span
          className={`inline-flex items-center rounded-lg bg-[#BA0C2F]/10 border border-[#BA0C2F]/30 text-[#BA0C2F] shrink-0 whitespace-nowrap shadow-2xs ${sizeClasses[size]}`}
          title="Generative AI strictly prohibited under OSU COAM rules"
        >
          <Ban className={`${iconSizes[size]} text-[#BA0C2F] shrink-0`} />
          <span>{label || 'Strictly Prohibited'}</span>
        </span>
      );

    case 'partial_allowed':
      return (
        <span
          className={`inline-flex items-center rounded-lg bg-amber-50 border border-amber-300 text-amber-900 shrink-0 whitespace-nowrap shadow-2xs ${sizeClasses[size]}`}
          title="Partial AI use permitted with conditions"
        >
          <AlertTriangle className={`${iconSizes[size]} text-amber-700 shrink-0`} />
          <span>{label || 'Partial / Limited'}</span>
        </span>
      );

    case 'study_prep_only':
      return (
        <span
          className={`inline-flex items-center rounded-lg bg-neutral-100 border border-neutral-300 text-neutral-800 shrink-0 whitespace-nowrap shadow-2xs ${sizeClasses[size]}`}
          title="Permitted only for study and practice tutoring"
        >
          <BookOpen className={`${iconSizes[size]} text-neutral-600 shrink-0`} />
          <span>{label || 'Study Prep Only'}</span>
        </span>
      );

    case 'allowed_with_disclosure':
      return (
        <span
          className={`inline-flex items-center rounded-lg bg-neutral-900 border border-neutral-900 text-white shrink-0 whitespace-nowrap shadow-2xs ${sizeClasses[size]}`}
          title="Allowed with proper citation and transparency disclosure"
        >
          <CheckCircle2 className={`${iconSizes[size]} text-emerald-400 shrink-0`} />
          <span>{label || 'Allowed w/ Disclosure'}</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-lg bg-neutral-100 text-neutral-700 shrink-0 whitespace-nowrap ${sizeClasses[size]}`}>
          <span>{label || 'Check Syllabus'}</span>
        </span>
      );
  }
};
