import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExam } from '@/lib/data/exams'
import { getIncident } from '@/lib/data/incidents'
import { INCIDENT_TYPE_LABELS } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { StatusBadge } from '@/components/status-badge'
import { SourceBadge } from '@/components/source-badge'
import { IncidentActions } from '@/components/incident-actions'

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
  const { details } = incident

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Teacher'} role="teacher" />

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <Link
          href="/teacher"
          className="inline-block rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
        >
          ← Back to dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            {INCIDENT_TYPE_LABELS[incident.type]}
          </h1>
          <StatusBadge status={incident.status} />
          <SourceBadge source={incident.source} />
        </div>

        {incident.source === 'simulated' && (
          <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            This incident was produced by simulation mode for testing. It was
            not detected by the AI models.
          </p>
        )}

        <section className="space-y-2 rounded-lg border bg-white p-4 text-sm text-gray-800">
          <h2 className="text-base font-medium text-gray-900">Summary</h2>
          <p>
            <span className="text-gray-500">Student:</span>{' '}
            {incident.studentName}
          </p>
          <p>
            <span className="text-gray-500">Examination:</span>{' '}
            {exam?.title ?? 'Unknown exam'}
          </p>
          <p>
            <span className="text-gray-500">Detected at:</span>{' '}
            {formatDateTime(incident.detectedAt)}
          </p>
        </section>

        <section className="space-y-2 rounded-lg border bg-white p-4 text-sm text-gray-800">
          <h2 className="text-base font-medium text-gray-900">
            Estimated readings
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Pattern seen {details.occurrences} times within{' '}
              {details.windowSeconds} seconds.
            </li>
            {details.direction && (
              <li>Head turned mostly toward: {details.direction}.</li>
            )}
            {details.maxYawDegrees !== undefined && (
              <li>
                Largest estimated head turn: {details.maxYawDegrees}°.
              </li>
            )}
            {details.awayPercent !== undefined && (
              <li>
                Eyes estimated off-screen for about {details.awayPercent}% of
                that time.
              </li>
            )}
          </ul>
          <p className="pt-2 text-gray-500">
            These are estimates, not proof. This flag means possible suspicious
            behavior only. Looking away can have ordinary explanations, so please
            use your own judgment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-medium text-gray-900">Your decision</h2>
          <IncidentActions incidentId={incident.id} status={incident.status} />
        </section>
      </main>
    </>
  )
}