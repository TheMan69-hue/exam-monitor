import type { IncidentSource } from '@/types'

export function SourceBadge({ source }: { source: IncidentSource }) {
  if (source === 'simulated') {
    return (
      <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
        Simulated
      </span>
    )
  }

  return (
    <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800">
      AI model
    </span>
  )
}