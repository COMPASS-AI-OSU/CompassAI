/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Course, Assignment, CourseSummary, StudentProfile, SessionUser } from '@/types';
import { getPublishedCourse } from '@/app/student-courses/actions';
import { Header } from './Header';
import { StepBreadcrumb } from './StepBreadcrumb';
import { Screen1Courses } from './Screen1Courses';
import { Screen2Assignments } from './Screen2Assignments';
import { Screen3Compass } from './Screen3Compass';
import { CourseSwitcher } from './CourseSwitcher';

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
  return { id: user.id, name: nameFromEmail(user.email), email: user.email, major: '', year: '' };
}

export default function CompassApp({
  user,
  initialCourses,
  coursesError,
}: {
  user: SessionUser | null;
  /** Every published course, loaded on the server (#14). */
  initialCourses: CourseSummary[];
  coursesError?: string;
}) {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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
      if (then) goTo(then);
      else if (currentScreen === 3 && course.assignments.length === 0) goTo(2);
    } catch {
      setLoadError('We couldn’t load this course. Check your connection and try again.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  const handleContinueToAssignments = () => {
    if (selectedCourse) goTo(2);
  };

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleContinueToCompass = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
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
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans antialiased selection:bg-[#BA0C2F]/20 selection:text-neutral-950">
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
              onSelectCourse={(id) => loadCourse(id)}
              onOpenCourse={(id) => loadCourse(id, 2)}
              onContinue={handleContinueToAssignments}
            />
          )}

          {/* SCREEN 2: Assignment Policy Table */}
          {currentScreen === 2 && selectedCourse && (
            <Screen2Assignments
              course={selectedCourse}
              selectedAssignment={selectedAssignment}
              onSelectAssignment={handleSelectAssignment}
              onBack={() => goTo(1)}
              onContinueToCompass={handleContinueToCompass}
              courseSwitcher={switcher}
            />
          )}

          {/* SCREEN 3: Compass chat. Keyed by course so switching courses starts a fresh chat. */}
          {currentScreen === 3 && selectedCourse && selectedAssignment && (
            <Screen3Compass
              key={selectedCourse.id}
              course={selectedCourse}
              assignment={selectedAssignment}
              student={currentStudent}
              isSignedIn={user !== null}
              onBack={() => goTo(2)}
              onSwitchAssignment={handleSelectAssignment}
              onSaveRecentSession={() => {
                /* "Pick up where you left off" comes with #23 */
              }}
              courseSwitcher={switcher}
            />
          )}
        </div>
      </main>

      {/* Ohio State University Footer */}
      <footer className="w-full py-4 border-t border-neutral-300 bg-white text-center text-xs text-neutral-500 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#BA0C2F]">CompassAI</span>
            <span className="text-neutral-300">·</span>
            <span className="font-medium text-neutral-700">The Ohio State University COAM Syllabus Companion</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-medium">Courses → Policy Table → Compass Chat</div>
        </div>
      </footer>
    </div>
  );
}
