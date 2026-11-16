import type { IncidentStatus } from '@/types'
import { INCIDENT_STATUS_LABELS } from '@/lib/labels'

const STYLES: Record<IncidentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-200 text-gray-700',
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {INCIDENT_STATUS_LABELS[status]}
    </span>
  )
}