import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { findSubject, groupBySubject } from '@/lib/subjects'
import { AppHeader } from '@/components/app-header'
import { ExamBoard, ExamCardTitle } from '@/components/exam-board'

export default async function StudentSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>
}) {
  const user = await requireRole('student')
  const { subject: subjectParam } = await params

  const subject = findSubject(groupBySubject(await getExams()), subjectParam)
  if (!subject) notFound()

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Student'} role="student" />

      <main className="page space-y-8">
        <Link href="/student" className="btn btn-ghost btn-sm">
          ← All subjects
        </Link>

        <div className="space-y-3">
          <span className="eyebrow">Subject</span>
          <h1>{subject.name}</h1>
        </div>

        <section className="space-y-4">
          <h2>Examinations</h2>

          <ExamBoard
            exams={subject.exams}
            renderCard={(exam) => (
              <>
                <ExamCardTitle exam={exam} />

                {exam.status === 'active' ? (
                  <Link
                    href={`/student/exam/${exam.id}`}
                    className="btn btn-primary btn-sm w-full"
                  >
                    Join
                  </Link>
                ) : (
                  <p className="text-sm text-pine-shadow">
                    {exam.status === 'scheduled' ? 'Not open yet' : 'Closed'}
                  </p>
                )}
              </>
            )}
          />
        </section>
      </main>
    </>
  )
}
