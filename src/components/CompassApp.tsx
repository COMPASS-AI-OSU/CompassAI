/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Course, Assignment, ChatMessage, CourseSummary, HistoryGroup, RecentSession, StudentProfile, SessionUser } from '@/types';
import { getPublishedCourse } from '@/app/student-courses/actions';
import { Header } from './Header';
import { StepBreadcrumb } from './StepBreadcrumb';
import { Screen1Courses } from './Screen1Courses';
import { Screen2Assignments } from './Screen2Assignments';
import { Screen3Compass } from './Screen3Compass';
import { CourseSwitcher } from './CourseSwitcher';
import { compassMessageFrom, timeAgo } from '@/lib/compass-message';

/**
 * "smith.123@osu.edu" becomes "Smith". We only collect an email, so the name comes from it.
 * Empty when there's no usable name; greetings then leave the name out.
 */
function nameFromEmail(email: string): string {
  const first = email.split('@')[0].split(/[._-]/)[0] ?? '';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function profileFor(user: SessionUser | null): StudentProfile {
  // Logged-out visitors have no name (issue #42), so they see "Welcome" and "Hi!".
  if (!user) return { id: 'guest', name: '', email: '', major: '', year: '' };
  return { id: user.id, name: user.firstName ?? nameFromEmail(user.email), email: user.email, major: '', year: '' };
}

/** A saved conversation about one assignment as chat bubbles, oldest first like any chat (#22). */
function threadFrom(group: HistoryGroup, courseCode: string): ChatMessage[] {
  return [...group.items].reverse().flatMap((item, i) => {
    const when = timeAgo(item.answeredAt);
    return [
      { id: `saved-q-${i}`, sender: 'user' as const, text: item.question, timestamp: when },
      compassMessageFrom({ ...item, suggestedContact: group.suggestedContact }, courseCode, `saved-a-${i}`, when),
    ];
  });
}

export default function CompassApp({
  user,
  initialCourses,
  coursesError,
  initialRecentSession = null,
  initialHistory = [],
}: {
  user: SessionUser | null;
  /** Every published course, loaded on the server (#14). */
  initialCourses: CourseSummary[];
  coursesError?: string;
  /** The student's last answered question, loaded on the server (#23). */
  initialRecentSession?: RecentSession | null;
  /** The student's saved questions and answers, grouped by assignment, newest first (#22). */
  initialHistory?: HistoryGroup[];
}) {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // "Pick up where you left off" (#23): the last answered question, and the conversation
  // Resume reopens. `chatKey` changes on each Resume so the Compass screen starts from it.
  const [recentSession, setRecentSession] = useState<RecentSession | null>(initialRecentSession);
  const [resumeMessages, setResumeMessages] = useState<ChatMessage[] | undefined>(undefined);
  const [chatKey, setChatKey] = useState(0);
  // Question history (#22). Kept current in the browser as new answers come in.
  const [history, setHistory] = useState<HistoryGroup[]>(initialHistory);
  const savedThread = (course: Course, assignmentId: string): ChatMessage[] | undefined => {
    const group = history.find((g) => g.courseId === course.id && g.assignmentId === assignmentId);
    return group ? threadFrom(group, course.code) : undefined;
  };
  const currentStudent = profileFor(user);

  const goTo = (screen: 1 | 2 | 3) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Loads a published course with its confirmed assignments. With `then`, moves to that
   * screen once it's loaded; otherwise stays put (the Compass screen falls back to the
   * policy table if the new course has no assignments yet).
   */
  const loadCourse = async (courseId: string, then?: 2 | 3) => {
    if (loadingCourseId) return;
    setLoadingCourseId(courseId);
    setLoadError(null);
    try {
      const { course, error } = await getPublishedCourse(courseId);
      if (!course) {
        setLoadError(error ?? 'This course isn’t available anymore. Your instructor may have unpublished it.');
        return;
      }
      setSelectedCourse(course);
      setSelectedAssignment(course.assignments[0] ?? null);
      setResumeMessages(undefined);
      if (then) goTo(then);
      else if (currentScreen === 3 && course.assignments.length === 0) goTo(2);
    } catch {
      setLoadError('We couldn’t load this course. Check your connection and try again.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  /** Opens the course and assignment of the last answered question, showing that question and answer. */
  const handleResumeRecent = async () => {
    if (!recentSession || loadingCourseId) return;
    const recent = recentSession;
    setLoadingCourseId(recent.courseId);
    setLoadError(null);
    try {
      const { course, error } = await getPublishedCourse(recent.courseId);
      const assignment = course?.assignments.find((a) => a.id === recent.assignmentId);
      if (!course || !assignment) {
        setRecentSession(null);
        setLoadError(error ?? 'That assignment isn’t available anymore. Your instructor may have unpublished it.');
        return;
      }
      const when = timeAgo(recent.answeredAt);
      setSelectedCourse(course);
      setSelectedAssignment(assignment);
      setResumeMessages(
        savedThread(course, assignment.id) ?? [
          { id: 'resume-q', sender: 'user', text: recent.question, timestamp: when },
          compassMessageFrom(recent, course.code, 'resume-a', when),
        ]
      );
      setChatKey((k) => k + 1);
      goTo(3);
    } catch {
      setLoadError('We couldn’t load this course. Check your connection and try again.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  /** Opens a saved conversation from "Your questions" (#22). */
  const handleOpenHistory = async (group: HistoryGroup) => {
    if (loadingCourseId) return;
    setLoadingCourseId(group.courseId);
    setLoadError(null);
    try {
      const { course, error } = await getPublishedCourse(group.courseId);
      const assignment = course?.assignments.find((a) => a.id === group.assignmentId);
      if (!course || !assignment) {
        setHistory((h) => h.filter((g) => g !== group));
        setLoadError(error ?? 'That assignment isn’t available anymore. Your instructor may have unpublished it.');
        return;
      }
      setSelectedCourse(course);
      setSelectedAssignment(assignment);
      setResumeMessages(threadFrom(group, course.code));
      setChatKey((k) => k + 1);
      goTo(3);
    } catch {
      setLoadError('We couldn’t load this course. Check your connection and try again.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  /** Switching assignments on the Compass screen: start from that assignment's saved questions. */
  const handleSelectAssignment = (assignment: Assignment) => {
    if (assignment.id === selectedAssignment?.id) return;
    setSelectedAssignment(assignment);
    setResumeMessages(selectedCourse ? savedThread(selectedCourse, assignment.id) : undefined);
    setChatKey((k) => k + 1);
  };

  const handleContinueToCompass = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setResumeMessages(selectedCourse ? savedThread(selectedCourse, assignment.id) : undefined);
    setChatKey((k) => k + 1);
    goTo(3);
  };

  const handleDirectNavigation = (screen: 1 | 2 | 3) => {
    if (screen === 1) goTo(1);
    else if (screen === 2 && selectedCourse) goTo(2);
    else if (screen === 3 && selectedCourse && selectedAssignment) goTo(3);
  };

  // Course switcher on the Policy and Compass screens: lists the student's My Courses.
  const switcher = selectedCourse && (
    <CourseSwitcher
      role={user?.role ?? null}
      current={{ id: selectedCourse.id, code: selectedCourse.code, name: selectedCourse.name }}
      loading={loadingCourseId !== null}
      error={currentScreen !== 1 ? loadError : null}
      onSwitch={(id) => loadCourse(id)}
    />
  );

  return (
    <div className="paper min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans antialiased selection:bg-[#BA0C2F]/20 selection:text-neutral-950">
      {/* Top Application Bar */}
      <Header currentScreen={currentScreen} onNavigateScreen={handleDirectNavigation} user={user} />

      {/* Breadcrumb & Quick Stepper with Back Button */}
      <StepBreadcrumb
        currentScreen={currentScreen}
        onBack={currentScreen === 2 ? () => goTo(1) : currentScreen === 3 ? () => goTo(2) : undefined}
        backLabel={
          currentScreen === 2
            ? 'Back to OSU Courses'
            : currentScreen === 3
              ? `Back to ${selectedCourse?.code || 'Course'} Policies`
              : 'Back'
        }
        courseCode={selectedCourse?.code}
        assignmentTitle={selectedAssignment?.title}
      />

      {/* Main Content Area (responsive: works on phones and laptops) */}
      <main className="flex-1 flex flex-col items-center justify-start py-4 sm:py-6 px-2 sm:px-4">
        <div className="w-full max-w-5xl">
          {/* SCREEN 1: Course Selection */}
          {currentScreen === 1 && (
            <Screen1Courses
              student={currentStudent}
              role={user?.role ?? null}
              courses={initialCourses}
              coursesError={coursesError}
              selectedCourseId={selectedCourse?.id ?? null}
              loadingCourseId={loadingCourseId}
              loadError={loadError}
              onOpenCourse={(id) => loadCourse(id, 2)}
              recentSession={user?.role === 'student' ? recentSession : null}
              onResumeRecent={handleResumeRecent}
              history={user?.role === 'student' ? history : []}
              onOpenHistory={handleOpenHistory}
            />
          )}

          {/* SCREEN 2: Assignment Policy Table */}
          {currentScreen === 2 && selectedCourse && (
            <Screen2Assignments
              course={selectedCourse}
              selectedAssignment={selectedAssignment}
              onBack={() => goTo(1)}
              onContinueToCompass={handleContinueToCompass}
              courseSwitcher={switcher}
            />
          )}

          {/* SCREEN 3: Compass chat. Keyed by course (and each Resume or new visit) so it starts fresh. */}
          {currentScreen === 3 && selectedCourse && selectedAssignment && (
            <Screen3Compass
              key={`${selectedCourse.id}:${chatKey}`}
              course={selectedCourse}
              assignment={selectedAssignment}
              student={currentStudent}
              isSignedIn={user !== null}
              onBack={() => goTo(2)}
              onSwitchAssignment={handleSelectAssignment}
              initialMessages={resumeMessages}
              onAnswered={(question, answer) => {
                // Keep the card current without another trip to the server (#23).
                if (user?.role !== 'student') return;
                const item = {
                  question,
                  verdict: answer.verdict as RecentSession['verdict'],
                  answer: answer.answer,
                  quote: answer.quote ?? null,
                  answeredAt: new Date().toISOString(),
                };
                // Newest answer first, and its assignment moves to the top of "Your questions" (#22).
                setHistory((groups) => {
                  const match = (g: HistoryGroup) =>
                    g.courseId === selectedCourse.id && g.assignmentId === selectedAssignment.id;
                  const existing = groups.find(match);
                  const updated: HistoryGroup = existing
                    ? { ...existing, items: [item, ...existing.items] }
                    : {
                        courseId: selectedCourse.id,
                        courseCode: selectedCourse.code,
                        assignmentId: selectedAssignment.id,
                        assignmentTitle: selectedAssignment.title,
                        suggestedContact: answer.suggestedContact ?? `${selectedCourse.professor} or your recitation TA`,
                        items: [item],
                      };
                  return [updated, ...groups.filter((g) => !match(g))];
                });
                setRecentSession({
                  courseId: selectedCourse.id,
                  courseCode: selectedCourse.code,
                  assignmentId: selectedAssignment.id,
                  assignmentTitle: selectedAssignment.title,
                  question,
                  verdict: answer.verdict as RecentSession['verdict'],
                  answer: answer.answer,
                  quote: answer.quote ?? null,
                  suggestedContact: answer.suggestedContact,
                  answeredAt: new Date().toISOString(),
                });
              }}
              courseSwitcher={switcher}
            />
          )}
        </div>
      </main>

      {/* Ohio State University Footer */}
      <footer className="w-full py-4 border-t border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-600 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-neutral-950">Compass<span className="text-[#BA0C2F]">AI</span></span>
            <span className="text-neutral-300">·</span>
            <span className="font-medium text-neutral-700">The Ohio State University COAM Syllabus Companion</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">Courses → Policy Table → Compass Chat</div>
        </div>
      </footer>
    </div>
  );
}
