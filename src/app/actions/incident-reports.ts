'use server'

import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
import type { Incident, IncidentType } from '@/types'

export type ReportInput = {
  examId: string
  type: IncidentType
  details: Incident['details']
}

export type ReportResult = { ok: boolean; message: string }

const GENERIC_FAILURE = 'The flag could not be sent.'

export async function reportIncident(
  input: ReportInput
): Promise<ReportResult> {
  // Server actions can be called directly, so verify the role here.
  await requireRole('student')

  // App-level switch. Until the real models are connected, reports are only
  // accepted while simulation mode is on.
  if (process.env.NEXT_PUBLIC_SIMULATION !== 'true') {
    return { ok: false, message: 'Simulation mode is off.' }
  }

  const supabase = await createClient()

  // The database function is the only way to create an incident. It decides
  // who the student is (auth.uid()), and it checks the role, the active exam,
  // the cooldown and the details. It also forces source = 'simulated' and
  // status = 'pending'.
  const { data, error } = await supabase.rpc('report_incident', {
    p_exam_id: input.examId,
    p_type: input.type,
    p_details: input.details,
  })

  if (error || !data) {
    return { ok: false, message: GENERIC_FAILURE }
  }

  // Expected outcomes (for example the cooldown) come with their own message.
  const result = data as { ok?: unknown; message?: unknown }

  return {
    ok: result.ok === true,
    message:
      typeof result.message === 'string' ? result.message : GENERIC_FAILURE,
  }
}