import type { IncidentStatus } from '@/types'
import { INCIDENT_STATUS_LABELS } from '@/lib/labels'

const STYLES: Record<IncidentStatus, string> = {
  pending: 'bg-blush-sand border-dusty-rose text-charcoal-navy',
  reviewed: 'bg-sea-foam border-mint-mist text-pine-shadow',
  dismissed: 'bg-paper-white border-mint-mist text-slate',
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={`badge ${STYLES[status]}`}>
      {INCIDENT_STATUS_LABELS[status]}
    </span>
  )
}
