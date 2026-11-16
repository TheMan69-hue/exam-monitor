import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { EXAM_STATUS_LABELS } from '@/lib/labels'
import { AppHeader } from '@/components/app-header'

export default async function StudentDashboard() {
  const user = await requireRole('student')
  const exams = await getExams()

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Student'} role="student" />

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Student Dashboard
        </h1>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">Examinations</h2>

          {exams.length === 0 && (
            <p className="text-sm text-gray-500">No examinations available.</p>
          )}

          <ul className="space-y-3">
            {exams.map((exam) => (
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

                {exam.status === 'active' ? (
                  <Link
                    href={`/student/exam/${exam.id}`}
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Join
                  </Link>
                ) : (
                  <span className="text-sm text-gray-400">
                    {exam.status === 'scheduled' ? 'Not open yet' : 'Closed'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  )
}