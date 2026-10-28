'use client';

import React, { useActionState } from 'react';
import { updateCourse, type ActionState } from '@/app/instructor/courses/actions';
import { FormAlert, submitWithoutReset } from '@/components/auth/fields';
import { InputField, TextAreaField } from './inputs';
import { primaryButton } from './InstructorChrome';

export interface CourseRow {
  id: string;
  code: string | null;
  name: string | null;
  term: string | null;
  professor: string | null;
  office_hours: string | null;
  overall_policy: string | null;
}

export function CourseDetailsForm({ course }: { course: CourseRow }) {
  const [state, action, pending] = useActionState<ActionState | undefined, FormData>(
    updateCourse.bind(null, course.id),
    undefined
  );
  const fe = state?.fieldErrors ?? {};
  const missing = !course.code || !course.name || !course.term;

  return (
    <form
      onSubmit={submitWithoutReset(action)}
      noValidate
      aria-labelledby="course-details-heading"
      className="bg-white border border-neutral-300 rounded-2xl p-5 sm:p-6 space-y-4"
    >
      <h2 id="course-details-heading" className="text-lg font-bold text-neutral-950">
        Course details
      </h2>
      {missing && !state && (
        <FormAlert tone="info">Your syllabus didn’t say everything we need. Fill in the empty fields and save.</FormAlert>
      )}
      {state?.error && <FormAlert tone="error">{state.error}</FormAlert>}
      {state?.saved && <FormAlert tone="success">{state.saved}</FormAlert>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField id="course-code" name="code" label="Course code" defaultValue={course.code} error={fe.code} maxLength={20} hint="Like BUS-MHR 2292" />
        <InputField id="course-name" name="name" label="Course name" defaultValue={course.name} error={fe.name} maxLength={200} />
        <InputField id="course-term" name="term" label="Term" defaultValue={course.term} error={fe.term} maxLength={40} hint="Like Autumn 2026" />
      </div>
      <InputField
        id="course-professor"
        name="professor"
        label="Professor"
        hint="As students know you, like Prof. Ty Shepfer. Students can search by this name."
        defaultValue={course.professor}
        error={fe.professor}
        maxLength={200}
      />
      <InputField id="course-office-hours" name="office_hours" label="Office hours" defaultValue={course.office_hours} error={fe.office_hours} maxLength={500} />
      <TextAreaField
        id="course-policy"
        name="overall_policy"
        label="Course-wide AI policy"
        hint="Students see this above the assignment table."
        defaultValue={course.overall_policy}
        error={fe.overall_policy}
        maxLength={4000}
        rows={4}
      />
      <button type="submit" disabled={pending} aria-disabled={pending} className={primaryButton}>
        {pending ? 'Saving…' : 'Save course details'}
      </button>
    </form>
  );
}
