'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import {
  createExam as insertExam,
  updateExamStatus,
} from '@/lib/data/exams'
import { withNotice } from '@/lib/notice'
import { MAX_SUBJECT_LENGTH, normalizeSubject, subjectHref } from '@/lib/subjects'
import type { ExamStatus } from '@/types'

// Forms say which teacher page to return to. Only teacher pages are allowed.
function returnPath(formData: FormData): string {
  const value = String(formData.get('return_to') ?? '')
  return /^\/teacher(\/subjects\/[A-Za-z0-9%._~-]+)?$/.test(value)
    ? value
    : '/teacher'
}

function backWithError(message: string, to = '/teacher'): never {
  redirect(`${to}?exam_error=${encodeURIComponent(message)}`)
}

export async function createExam(formData: FormData) {
  // Server actions can be called directly, so check the role here.
  const user = await requireRole('teacher')

  const back = returnPath(formData)
  const title = String(formData.get('title') ?? '').trim()
  const subject = normalizeSubject(String(formData.get('subject') ?? ''))
  const durationText = String(formData.get('duration') ?? '').trim()

  if (title.length < 1 || title.length > 120) {
    backWithError('The title must be between 1 and 120 characters.', back)
  }

  if (subject.length < 1 || subject.length > MAX_SUBJECT_LENGTH) {
    backWithError(
      `The subject must be between 1 and ${MAX_SUBJECT_LENGTH} characters.`,
      back
    )
  }

  if (!/^\d+$/.test(durationText)) {
    backWithError('The duration must be a whole number of minutes.', back)
  }

  const durationMinutes = Number(durationText)
  if (durationMinutes < 1 || durationMinutes > 600) {
    backWithError('The duration must be between 1 and 600 minutes.', back)
  }

  try {
    await insertExam(user.id, { title, subject, durationMinutes })
  } catch {
    backWithError('The examination could not be created. Please try again.', back)
  }

  revalidatePath('/teacher', 'layout')
  revalidatePath('/student', 'layout')
  redirect(withNotice(subjectHref('/teacher', subject), 'Examination created'))
}

export async function setExamStatus(formData: FormData) {
  const user = await requireRole('teacher')

  const back = returnPath(formData)
  const examId = String(formData.get('examId') ?? '')
  const target = String(formData.get('status') ?? '')

  // Only two one-way steps exist: scheduled -> active and active -> ended.
  if (target !== 'active' && target !== 'ended') {
    backWithError('Invalid request.', back)
  }

  const from: ExamStatus = target === 'active' ? 'scheduled' : 'active'
  const to: ExamStatus = target === 'active' ? 'active' : 'ended'

  let changed = false
  try {
    // Ownership and the expected current status are enforced inside this
    // function (and again by the database RLS rules).
    changed = await updateExamStatus(user.id, examId, from, to)
  } catch {
    backWithError('The examination could not be updated. Please try again.', back)
  }

  if (!changed) {
    backWithError(
      'Nothing was changed. The examination may belong to another teacher, or its status already changed. Refresh and try again.',
      back
    )
  }

  revalidatePath('/teacher', 'layout')
  revalidatePath('/student', 'layout')
  redirect(
    withNotice(
      back,
      to === 'active' ? 'Examination started' : 'Examination ended'
    )
  )
}