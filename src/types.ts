export type AIPolicyStatus = 'strictly_prohibited' | 'partial_allowed' | 'study_prep_only' | 'allowed_with_disclosure';

export interface QuickPrompt {
  label: string; // The short text for button [X], [Y], [Z]
  question: string;
  response: {
    verdict: string;
    verdictType: 'allowed' | 'prohibited' | 'caution' | 'out_of_scope' | 'contact_instructor';
    policySummary: string;
    allowedUses: string[];
    prohibitedUses: string[];
    instructorQuote: string;
    citationTip?: string;
    sourceReliedOn?: string;
    isSure?: boolean;
    sureReason?: string;
    suggestedContact?: string;
  };
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  dueDateTimestamp?: number; // Epoch timestamp for chronological sorting
  aiStatus: AIPolicyStatus;
  aiStatusLabel: string;
  instructorComment: string;
  syllabusClause?: string;
  quickPrompts: [QuickPrompt, QuickPrompt, QuickPrompt]; // Wireframe shows 3 buttons: X, Y, Z
}

export interface Course {
  id: string;
  code: string;
  name: string;
  professor: string;
  department: string;
  term: string;
  overallPolicy: string;
  assignments: Assignment[];
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
