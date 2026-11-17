'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import {
  createExam as insertExam,
  updateExamStatus,
} from '@/lib/data/exams'
import type { ExamStatus } from '@/types'

function backWithError(message: string): never {
  redirect(`/teacher?exam_error=${encodeURIComponent(message)}`)
}

export async function createExam(formData: FormData) {
  // Server actions can be called directly, so check the role here.
  const user = await requireRole('teacher')

  const title = String(formData.get('title') ?? '').trim()
  const durationText = String(formData.get('duration') ?? '').trim()

  if (title.length < 1 || title.length > 120) {
    backWithError('The title must be between 1 and 120 characters.')
  }

  if (!/^\d+$/.test(durationText)) {
    backWithError('The duration must be a whole number of minutes.')
  }

  const durationMinutes = Number(durationText)
  if (durationMinutes < 1 || durationMinutes > 600) {
    backWithError('The duration must be between 1 and 600 minutes.')
  }

  try {
    await insertExam(user.id, { title, durationMinutes })
  } catch {
    backWithError('The examination could not be created. Please try again.')
  }

  revalidatePath('/teacher')
  redirect('/teacher')
}

export async function setExamStatus(formData: FormData) {
  const user = await requireRole('teacher')

  const examId = String(formData.get('examId') ?? '')
  const target = String(formData.get('status') ?? '')

  // Only two one-way steps exist: scheduled -> active and active -> ended.
  if (target !== 'active' && target !== 'ended') {
    backWithError('Invalid request.')
  }

  const from: ExamStatus = target === 'active' ? 'scheduled' : 'active'
  const to: ExamStatus = target === 'active' ? 'active' : 'ended'

  let changed = false
  try {
    // Ownership and the expected current status are enforced inside this
    // function (and again by the database RLS rules).
    changed = await updateExamStatus(user.id, examId, from, to)
  } catch {
    backWithError('The examination could not be updated. Please try again.')
  }

  if (!changed) {
    backWithError(
      'Nothing was changed. The examination may belong to another teacher, or its status already changed. Refresh and try again.'
    )
  }

  revalidatePath('/teacher')
  revalidatePath('/student')
  redirect('/teacher')
}