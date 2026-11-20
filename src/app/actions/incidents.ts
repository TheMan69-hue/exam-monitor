'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { updateIncidentStatus } from '@/lib/data/incidents'
import { withNotice } from '@/lib/notice'
import type { IncidentStatus } from '@/types'

const ALLOWED_STATUSES: IncidentStatus[] = ['pending', 'reviewed', 'dismissed']

const NOTICES: Record<IncidentStatus, string> = {
  pending: 'Incident reopened',
  reviewed: 'Marked as reviewed',
  dismissed: 'Incident dismissed',
}

export async function setIncidentStatus(formData: FormData) {
  // Server actions can be called directly, so check the role here too.
  await requireRole('teacher')

  const incidentId = String(formData.get('incidentId') ?? '')
  const status = String(formData.get('status') ?? '') as IncidentStatus

  if (!incidentId || !ALLOWED_STATUSES.includes(status)) return

  await updateIncidentStatus(incidentId, status)

  revalidatePath('/teacher')
  revalidatePath(`/teacher/incidents/${incidentId}`)
  redirect(
    withNotice(`/teacher/incidents/${incidentId}`, NOTICES[status])
  )
}