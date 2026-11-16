import type { ExamStatus, IncidentStatus, IncidentType } from '@/types'

// All wording uses "possible"; the system never declares cheating.
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  head_turn: 'Possible repeated head turn',
  gaze_away: 'Possible repeated looking away from screen',
}

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  pending: 'Pending review',
  reviewed: 'Reviewed',
  dismissed: 'Dismissed',
}

export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  scheduled: 'Scheduled',
  active: 'Active',
  ended: 'Ended',
}