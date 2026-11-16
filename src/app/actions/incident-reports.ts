'use server'

import { requireRole } from '@/lib/auth/require-role'
import { DETECTION_CONFIG } from '@/lib/ai/config'
import { getExam } from '@/lib/data/exams'
import { createIncident } from '@/lib/data/incidents'
import type { Incident, IncidentType } from '@/types'

export type ReportInput = {
  examId: string
  type: IncidentType
  details: Incident['details']
}

export type ReportResult = { ok: boolean; message: string }

const TYPES: IncidentType[] = ['head_turn', 'gaze_away']

// Remembers when each student last reported in each exam (mock, in memory).
const globalForReports = globalThis as unknown as {
  lastReportAt?: Map<string, number>
}

function clampNumber(value: unknown, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

export async function reportIncident(
  input: ReportInput
): Promise<ReportResult> {
  // Server actions can be called directly, so verify the role here.
  const user = await requireRole('student')

  // Until the real models are connected, only simulated reports are accepted,
  // and only while simulation mode is on.
  if (process.env.NEXT_PUBLIC_SIMULATION !== 'true') {
    return { ok: false, message: 'Simulation mode is off.' }
  }

  if (!TYPES.includes(input.type)) {
    return { ok: false, message: 'Invalid report.' }
  }

  const exam = await getExam(String(input.examId))
  if (!exam || exam.status !== 'active') {
    return { ok: false, message: 'This examination is not active.' }
  }

  const occurrences = clampNumber(input.details?.occurrences, 1, 100)
  const windowSeconds = clampNumber(input.details?.windowSeconds, 1, 3600)
  if (occurrences === undefined || windowSeconds === undefined) {
    return { ok: false, message: 'Invalid report.' }
  }

  const rawDirection = input.details?.direction
  const direction =
    rawDirection === 'left' || rawDirection === 'right' || rawDirection === 'both'
      ? rawDirection
      : undefined

  // Cooldown per student per exam, enforced on the server as well.
  const reports = (globalForReports.lastReportAt ??= new Map<string, number>())
  const key = `${user.id}:${exam.id}`
  const last = reports.get(key) ?? 0
  if (Date.now() - last < DETECTION_CONFIG.cooldownSeconds * 1000) {
    return {
      ok: false,
      message: 'A flag was sent recently, so this one was skipped (cooldown).',
    }
  }
  reports.set(key, Date.now())

  // The server decides who the student is, the time, and the source.
  await createIncident({
    examId: exam.id,
    studentName: user.fullName || user.email || 'Student',
    type: input.type,
    detectedAt: new Date().toISOString(),
    source: 'simulated',
    details: {
      occurrences,
      windowSeconds,
      direction,
      maxYawDegrees: clampNumber(input.details?.maxYawDegrees, 0, 180),
      awayPercent: clampNumber(input.details?.awayPercent, 0, 100),
    },
  })

  return { ok: true, message: 'Flag sent to your teacher (simulated).' }
}