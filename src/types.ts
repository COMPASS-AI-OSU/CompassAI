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

export interface RecentSession {
  courseId: string;
  assignmentId: string;
  lastActive: string;
  questionSnippet: string;
}

/** The signed-in person, as the browser sees them. Role is set only by the server. */
export interface SessionUser {
  id: string;
  email: string;
  role: 'student' | 'instructor';
}
