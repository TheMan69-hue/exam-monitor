import type { Incident, IncidentStatus } from '@/types'
import { mockIncidents } from '@/lib/mock/data'

// Mock state lives on globalThis so it survives hot reloads and is shared
// between pages and server actions. It resets when the dev server restarts.
const globalForMock = globalThis as unknown as {
  mockIncidentStore?: Incident[]
}

function store(): Incident[] {
  if (!globalForMock.mockIncidentStore) {
    // The seed incidents are fake, so they are labeled as simulated.
    globalForMock.mockIncidentStore = structuredClone(mockIncidents).map(
      (incident): Incident => ({ ...incident, source: 'simulated' })
    )
  }
  return globalForMock.mockIncidentStore
}

// Phase 4: replace the bodies of these functions with Supabase queries.
// Keep the names and return types the same so pages don't change.

export async function getIncidents(): Promise<Incident[]> {
  return [...store()].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt))
}

export async function getIncident(id: string): Promise<Incident | null> {
  return store().find((incident) => incident.id === id) ?? null
}

export type NewIncident = Omit<Incident, 'id' | 'status'>

export async function createIncident(input: NewIncident): Promise<Incident> {
  const incident: Incident = {
    ...input,
    id: `inc-${crypto.randomUUID().slice(0, 8)}`,
    status: 'pending',
  }
  store().push(incident)
  return incident
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus
): Promise<Incident | null> {
  const incident = store().find((item) => item.id === id)
  if (!incident) return null
  incident.status = status
  return incident
}