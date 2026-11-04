// Type-only import: erased at build time, so client code never loads the server-only AI module.
import type { CompassVerdict } from '@/lib/compass-ai';

export type AIPolicyStatus = 'allowed' | 'allowed_with_disclosure' | 'partial_allowed' | 'strictly_prohibited' | 'study_prep_only';

/** A suggested question on the Compass screen. */
export interface QuickPrompt {
  label: string;
  question: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  dueDateTimestamp?: number; // For sorting by due date; assignments with no date sort last
  aiStatus: AIPolicyStatus;
  aiStatusLabel: string;
  instructorComment: string;
  syllabusClause?: string;
  quickPrompts: QuickPrompt[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  department: string;
  term: string;
  overallPolicy: string;
  officeHours?: string;
  assignments: Assignment[];
}

/** A published course in the Courses list, before its assignments are loaded. */
export interface CourseSummary {
  id: string;
  code: string | null;
  name: string | null;
  term: string | null;
  professor: string | null;
  assignmentCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'compass';
  text: string;
  timestamp: string;
  verdictType?: 'allowed' | 'prohibited' | 'caution' | 'out_of_scope' | 'contact_instructor';
  sourceReliedOn?: string;
  isSure?: boolean;
  sureReason?: string;
  suggestedContact?: string;
  metadata?: {
    allowedUses?: string[];
    prohibitedUses?: string[];
    instructorQuote?: string;
    citationTip?: string;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  major: string;
  year: string;
}

/** The student's last answered question, for the "Pick up where you left off" card (#23). */
export interface RecentSession {
  courseId: string;
  courseCode: string;
  assignmentId: string;
  assignmentTitle: string;
  question: string;
  verdict: CompassVerdict;
  answer: string;
  quote: string | null;
  suggestedContact?: string;
  /** ISO timestamp of when Compass answered. */
  answeredAt: string;
}

/** The signed-in person, as the browser sees them. Role is set only by the server. */
export interface SessionUser {
  id: string;
  email: string;
  role: 'student' | 'instructor';
}
