import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { getIncidents } from '@/lib/data/incidents'
import { EXAM_STATUS_LABELS, INCIDENT_TYPE_LABELS } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { StatusBadge } from '@/components/status-badge'

export default async function TeacherDashboard() {
  const user = await requireRole('teacher')

  const [exams, incidents] = await Promise.all([getExams(), getIncidents()])

  const examTitles = new Map(exams.map((exam) => [exam.id, exam.title]))
  const activeExams = exams.filter((exam) => exam.status === 'active')

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Teacher'} role="teacher" />

      <main className="mx-auto max-w-4xl space-y-8 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Teacher Dashboard
        </h1>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">
            Active examinations
          </h2>

          {activeExams.length === 0 && (
            <p className="text-sm text-gray-500">No active examinations.</p>
          )}

          <ul className="space-y-3">
            {activeExams.map((exam) => {
              const pending = incidents.filter(
                (incident) =>
                  incident.examId === exam.id && incident.status === 'pending'
              ).length

              return (
                <li
                  key={exam.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{exam.title}</p>
                    <p className="text-sm text-gray-500">
                      {EXAM_STATUS_LABELS[exam.status]} · {exam.durationMinutes}{' '}
                      minutes
                    </p>
                  </div>
                  <span className="text-sm text-gray-700">
                    {pending} pending {pending === 1 ? 'flag' : 'flags'}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">
            Flagged incidents
          </h2>
          <p className="text-sm text-gray-600">
            These are possible suspicious behaviors detected by the system. Each
            one needs your review.
          </p>

          {incidents.length === 0 ? (
            <p className="text-sm text-gray-500">No flagged incidents.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="w-full text-left text-sm text-gray-800">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 font-medium">Student</th>
                    <th className="p-3 font-medium">Examination</th>
                    <th className="p-3 font-medium">Pattern</th>
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="border-b last:border-b-0">
                      <td className="p-3">{incident.studentName}</td>
                      <td className="p-3">
                        {examTitles.get(incident.examId) ?? 'Unknown exam'}
                      </td>
                      <td className="p-3">
                        {INCIDENT_TYPE_LABELS[incident.type]}
                      </td>
                      <td className="p-3">
                        {formatDateTime(incident.detectedAt)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/teacher/incidents/${incident.id}`}
                          className="text-blue-600 underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  )
}