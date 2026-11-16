'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth/require-role'
import { updateIncidentStatus } from '@/lib/data/incidents'
import type { IncidentStatus } from '@/types'

const ALLOWED_STATUSES: IncidentStatus[] = ['pending', 'reviewed', 'dismissed']

export async function setIncidentStatus(formData: FormData) {
  // Server actions can be called directly, so check the role here too.
  await requireRole('teacher')

  const incidentId = String(formData.get('incidentId') ?? '')
  const status = String(formData.get('status') ?? '') as IncidentStatus

  if (!incidentId || !ALLOWED_STATUSES.includes(status)) return

  await updateIncidentStatus(incidentId, status)

  revalidatePath('/teacher')
  revalidatePath(`/teacher/incidents/${incidentId}`)
}