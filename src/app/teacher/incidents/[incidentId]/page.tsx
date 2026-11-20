import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExam } from '@/lib/data/exams'
import { getIncident, getIncidents } from '@/lib/data/incidents'
import { INCIDENT_TYPE_LABELS } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { StatusBadge } from '@/components/status-badge'
import { SourceBadge } from '@/components/source-badge'
import { IncidentActions } from '@/components/incident-actions'
import { FlagTimeline } from '@/components/flag-timeline'

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>
}) {
  const user = await requireRole('teacher')
  const { incidentId } = await params

  const incident = await getIncident(incidentId)
  if (!incident) notFound()

  const exam = await getExam(incident.examId)
  const related = (await getIncidents()).filter(
    (other) =>
      other.examId === incident.examId &&
      other.studentName === incident.studentName
  )
  const { details } = incident

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Teacher'} role="teacher" />

      <main className="page space-y-8">
        <Link href="/teacher" className="btn btn-ghost btn-sm">
          ← Back to dashboard
        </Link>

        <div className="space-y-3">
          <span className="eyebrow">Flagged incident</span>
          <div className="flex flex-wrap items-center gap-3">
            <h1>{INCIDENT_TYPE_LABELS[incident.type]}</h1>
            <StatusBadge status={incident.status} />
            <SourceBadge source={incident.source} />
          </div>
        </div>

        {incident.source === 'simulated' && (
          <p className="notice">
            This incident was produced by simulation mode for testing. It was
            not detected by the AI models.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <section className="card space-y-3 text-sm">
            <span className="eyebrow">Summary</span>
            <p>
              <span className="text-pine-shadow">Student:</span>{' '}
              {incident.studentName}
            </p>
            <p>
              <span className="text-pine-shadow">Examination:</span>{' '}
              {exam?.title ?? 'Unknown exam'}
            </p>
            <p>
              <span className="text-pine-shadow">Detected at:</span>{' '}
              {formatDateTime(incident.detectedAt)}
            </p>
          </section>

          <section className="card space-y-3 text-sm">
            <span className="eyebrow">Estimated readings</span>
            <ul className="checklist">
              <li>
                Pattern seen {details.occurrences} times within{' '}
                {details.windowSeconds} seconds.
              </li>
              {details.direction && (
                <li>Head turned mostly toward: {details.direction}.</li>
              )}
              {details.maxYawDegrees !== undefined && (
                <li>Largest estimated head turn: {details.maxYawDegrees}°.</li>
              )}
              {details.awayPercent !== undefined && (
                <li>
                  Eyes estimated off-screen for about {details.awayPercent}% of
                  that time.
                </li>
              )}
            </ul>
          </section>
        </div>

        <FlagTimeline incidents={related} currentId={incident.id} />

        <p className="card card-blush max-w-3xl text-sm">
          These are estimates, not proof. This flag means possible suspicious
          behavior only. Looking away can have ordinary explanations, so please
          use your own judgment.
        </p>

        <section className="space-y-3">
          <h2>Your decision</h2>
          <IncidentActions incidentId={incident.id} status={incident.status} />
        </section>
      </main>
    </>
  )
}
