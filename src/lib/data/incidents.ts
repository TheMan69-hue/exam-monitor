import { createClient } from '@/lib/supabase/server'
import type {
  Incident,
  IncidentSource,
  IncidentStatus,
  IncidentType,
} from '@/types'

// Rows as they are stored in the database (snake_case).
type IncidentRow = {
  id: string
  exam_id: string
  student_name: string
  type: string
  source: string
  status: string
  details: Incident['details'] | null
  detected_at: string
}

const INCIDENT_COLUMNS =
  'id, exam_id, student_name, type, source, status, details, detected_at'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    examId: row.exam_id,
    studentName: row.student_name,
    type: row.type as IncidentType,
    source: row.source as IncidentSource,
    status: row.status as IncidentStatus,
    detectedAt: row.detected_at,
    details: row.details ?? { occurrences: 0, windowSeconds: 0 },
  }
}

// All of these use the signed-in user's own session, so RLS decides access:
// teachers can read all incidents and change their status; nobody else can.
// Incidents are created only by the report_incident database function.

export async function getIncidents(): Promise<Incident[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('incidents')
    .select(INCIDENT_COLUMNS)
    .order('detected_at', { ascending: false })

  if (error) throw new Error(`Could not load incidents: ${error.message}`)

  return (data as IncidentRow[]).map(toIncident)
}

export async function getIncident(id: string): Promise<Incident | null> {
  // A malformed id can never match, so treat it as "not found".
  if (!UUID_PATTERN.test(id)) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('incidents')
    .select(INCIDENT_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Could not load the incident: ${error.message}`)

  return data ? toIncident(data as IncidentRow) : null
}

// Returns null if no row was changed (unknown id, or blocked by RLS).
export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus
): Promise<Incident | null> {
  if (!UUID_PATTERN.test(id)) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('incidents')
    .update({ status })
    .eq('id', id)
    .select(INCIDENT_COLUMNS)
    .maybeSingle()

  if (error) throw new Error(`Could not update the incident: ${error.message}`)

  return data ? toIncident(data as IncidentRow) : null
}