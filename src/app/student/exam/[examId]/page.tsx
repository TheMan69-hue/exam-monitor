import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExam } from '@/lib/data/exams'
import { AppHeader } from '@/components/app-header'
import { ConsentNotice } from '@/components/consent-notice'
import { ExamSessionPanel } from '@/components/exam-session-panel'

export default async function StudentExamPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const user = await requireRole('student')
  const { examId } = await params

  const exam = await getExam(examId)
  if (!exam) notFound()

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Student'} role="student" />

      <main className="mx-auto max-w-4xl space-y-6 p-6">
        <Link
          href="/student"
          className="inline-block rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
        >
          ← Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">{exam.title}</h1>

        {exam.status !== 'active' ? (
          <p className="rounded border bg-white p-4 text-sm text-gray-700">
            This examination is not open right now.
          </p>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-lg font-medium text-gray-900">
                Instructions
              </h2>
              <p className="text-sm text-gray-500">
                Duration: {exam.durationMinutes} minutes
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
                {exam.instructions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <ConsentNotice />
            <ExamSessionPanel examId={exam.id} />
          </>
        )}
      </main>
    </>
  )
}