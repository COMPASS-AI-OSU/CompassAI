/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { Course, Assignment, StudentProfile, RecentSession, SessionUser } from '@/types';
import { COURSES } from '@/data/courses';
import { Header } from './Header';
import { StepBreadcrumb } from './StepBreadcrumb';
import { Screen1Courses } from './Screen1Courses';
import { Screen2Assignments } from './Screen2Assignments';
import { Screen3Compass } from './Screen3Compass';

/** "smith.123@osu.edu" becomes "Smith". We only collect an email, so the name comes from it. */
function nameFromEmail(email: string): string {
  const first = email.split('@')[0].split(/[._-]/)[0] || 'there';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function profileFor(user: SessionUser | null): StudentProfile {
  if (!user) return { id: 'guest', name: 'there', email: '', major: '', year: '' };
  return { id: user.id, name: nameFromEmail(user.email), email: user.email, major: '', year: '' };
}

export default function CompassApp({ user }: { user: SessionUser | null }) {
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3>(1);
  const [courses] = useState<Course[]>(COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(COURSES[0]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(
    COURSES[0].assignments[0] // Default to Crisis Case Preparation & Execution
  );
  const currentStudent = profileFor(user);
  // The "Pick Up Where You Left Off" card is hidden until issue #23 shows each student's real
  // last conversation; the prototype's sample session made every student see the same fake one.
  const [recentSession, setRecentSession] = useState<RecentSession | null>(null);

  // Navigation handlers
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    if (course.assignments.length > 0) {
      setSelectedAssignment(course.assignments[0]);
    }
  };

  const handleContinueToAssignments = () => {
    if (selectedCourse) {
      setCurrentScreen(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
  };

  const handleContinueToCompass = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentScreen(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCourses = () => {
    setCurrentScreen(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToAssignments = () => {
    setCurrentScreen(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeRecent = () => {
    if (!recentSession) return;
    const course = courses.find((c) => c.id === recentSession.courseId);
    if (course) {
      setSelectedCourse(course);
      const assignment = course.assignments.find((a) => a.id === recentSession.assignmentId);
      if (assignment) {
        setSelectedAssignment(assignment);
      }
      setCurrentScreen(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveRecentSession = (questionSnippet: string) => {
    if (selectedCourse && selectedAssignment) {
      setRecentSession({
        courseId: selectedCourse.id,
        assignmentId: selectedAssignment.id,
        lastActive: 'Just now',
        questionSnippet,
      });
    }
  };

  const handleDirectNavigation = (screen: 1 | 2 | 3) => {
    if (screen === 1) {
      setCurrentScreen(1);
    } else if (screen === 2 && selectedCourse) {
      setCurrentScreen(2);
    } else if (screen === 3 && selectedCourse && selectedAssignment) {
      setCurrentScreen(3);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans antialiased selection:bg-[#BA0C2F]/20 selection:text-neutral-950">
      {/* Top Application Bar */}
      <Header
        currentScreen={currentScreen}
        onNavigateScreen={handleDirectNavigation}
        user={user}
      />

      {/* Breadcrumb & Quick Stepper with Back Button */}
      <StepBreadcrumb
        currentScreen={currentScreen}
        onBack={
          currentScreen === 2
            ? handleBackToCourses
            : currentScreen === 3
            ? handleBackToAssignments
            : undefined
        }
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
          {/* SCREEN 1: Course Selection matching IMG_5271.JPG */}
          {currentScreen === 1 && (
            <Screen1Courses
              student={currentStudent}
              role={user?.role ?? null}
              courses={courses}
              selectedCourse={selectedCourse}
              onSelectCourse={handleSelectCourse}
              onContinue={handleContinueToAssignments}
              recentSession={null /* hidden until #23 */}
              onResumeRecent={handleResumeRecent}
            />
          )}

          {/* SCREEN 2: Assignment Policy Table matching IMG_5272.JPG */}
          {currentScreen === 2 && selectedCourse && (
            <Screen2Assignments
              course={selectedCourse}
              selectedAssignment={selectedAssignment}
              onSelectAssignment={handleSelectAssignment}
              onBack={handleBackToCourses}
              onContinueToCompass={handleContinueToCompass}
            />
          )}

          {/* SCREEN 3: CompassAI Interactive Guidance matching IMG_5273.JPG */}
          {currentScreen === 3 && selectedCourse && selectedAssignment && (
            <Screen3Compass
              course={selectedCourse}
              assignment={selectedAssignment}
              student={currentStudent}
              isSignedIn={user !== null}
              onBack={handleBackToAssignments}
              onSwitchAssignment={handleSelectAssignment}
              onSaveRecentSession={handleSaveRecentSession}
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
          <div className="text-[11px] text-neutral-500 font-medium">
            Scarlet & Gray Prototype · Courses → Policy Table → Compass Chat
          </div>
        </div>
      </footer>
    </div>
  );
}
