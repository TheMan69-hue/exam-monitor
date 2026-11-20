import Link from 'next/link'
import { INCIDENT_TYPE_LABELS } from '@/lib/labels'
import { formatTime } from '@/lib/format'
import type { Incident, IncidentStatus } from '@/types'

const DOT_COLORS: Record<IncidentStatus, string> = {
  pending: 'bg-dusty-rose',
  reviewed: 'bg-sage',
  dismissed: 'bg-mint-mist',
}

const MIN_SPAN_MS = 60_000

// Every flag for one student in one examination, placed by time of detection.
export function FlagTimeline({
  incidents,
  currentId,
}: {
  incidents: Incident[]
  currentId: string
}) {
  const ordered = [...incidents].sort(
    (a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime()
  )
  const start = new Date(ordered[0].detectedAt).getTime()
  const end = new Date(ordered[ordered.length - 1].detectedAt).getTime()
  const span = Math.max(end - start, MIN_SPAN_MS)

  // Keep dots away from the edges of the track.
  const position = (iso: string) =>
    5 + ((new Date(iso).getTime() - start) / span) * 90

  return (
    <section className="card space-y-4">
      <div className="space-y-2">
        <span className="eyebrow">Flag timeline</span>
        <p className="text-sm">
          {ordered.length === 1
            ? 'This is the only flag for this student in this examination.'
            : `${ordered.length} flags for this student in this examination.`}
        </p>
      </div>

      <div className="relative h-12">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-mint-mist" />
        {ordered.map((incident) => {
          const current = incident.id === currentId
          const label = `${formatTime(incident.detectedAt)} · ${INCIDENT_TYPE_LABELS[incident.type]}`
          return (
            <Link
              key={incident.id}
              href={`/teacher/incidents/${incident.id}`}
              aria-current={current ? 'page' : undefined}
              aria-label={label}
              title={label}
              style={{ left: `${position(incident.detectedAt)}%` }}
              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-illustration-ink ${
                DOT_COLORS[incident.status]
              } ${
                current
                  ? 'h-6 w-6 ring-4 ring-ink-navy/30'
                  : 'h-4 w-4 hover:scale-125'
              }`}
            />
          )
        })}
      </div>

      <div className="flex justify-between font-mono text-[13px] uppercase tracking-[0.04em] text-pine-shadow">
        <span>{formatTime(ordered[0].detectedAt)}</span>
        {ordered.length > 1 && (
          <span>{formatTime(ordered[ordered.length - 1].detectedAt)}</span>
        )}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {(
          [
            ['pending', 'Pending'],
            ['reviewed', 'Reviewed'],
            ['dismissed', 'Dismissed'],
          ] as const
        ).map(([status, label]) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full border border-illustration-ink ${DOT_COLORS[status]}`}
            />
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
