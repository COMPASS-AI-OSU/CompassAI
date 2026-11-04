import type { ChatMessage } from '@/types';

/** One Compass answer, as /api/advisor returns it and as `questions` stores it. */
export interface CompassAnswer {
  verdict: string;
  answer: string;
  quote?: string | null;
  suggestedContact?: string;
}

/**
 * Turns a Compass answer into the chat bubble the Compass screen shows. Used for live
 * answers and for the saved answer that "Pick up where you left off" reopens (#23).
 */
export function compassMessageFrom(data: CompassAnswer, courseCode: string, id: string, timestamp = 'Just now'): ChatMessage {
  if (data.verdict === 'off_topic') {
    // Off-topic (#18): just the polite message, with no verdict and no syllabus quote.
    return { id, sender: 'compass', text: data.answer, timestamp, verdictType: 'out_of_scope' };
  }
  const isCovered = data.verdict !== 'ask_instructor';
  return {
    id,
    sender: 'compass',
    text: data.answer,
    timestamp,
    verdictType:
      data.verdict === 'allowed' ? 'allowed' : data.verdict === 'not_allowed' ? 'prohibited' : 'contact_instructor',
    sourceReliedOn: data.quote ? `“${data.quote.replace(/^[“"]+|[”"]+$/g, '')}”` : undefined,
    isSure: isCovered,
    sureReason: isCovered ? `Quoted from the ${courseCode} syllabus` : 'The syllabus doesn’t clearly cover this question',
    suggestedContact: data.suggestedContact,
  };
}

/** "Just now", "5 mins ago", "3 hours ago", "2 days ago", or the date for anything older. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? 'Yesterday' : `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
