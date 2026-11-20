import type { IncidentSource } from '@/types'

export function SourceBadge({ source }: { source: IncidentSource }) {
  if (source === 'simulated') {
    return (
      <span className="badge border-dusty-rose bg-blush-sand text-charcoal-navy">
        Simulated
      </span>
    )
  }

  return (
    <span className="badge border-mint-mist bg-card-mint text-pine-shadow">
      AI model
    </span>
  )
}
