import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExam } from '@/lib/data/exams'
import { subjectHref } from '@/lib/subjects'
import { AppHeader } from '@/components/app-header'
import { ConsentNotice } from '@/components/consent-notice'
import { EmptyState } from '@/components/empty-state'
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

  const subjectLink = subjectHref('/student', exam.subject)

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Student'} role="student" />

      <main className="page space-y-8">
        <nav aria-label="Breadcrumb">
          <Link href={subjectLink} className="btn btn-ghost btn-sm">
            ← Back to {exam.subject}
          </Link>
        </nav>

        <header className="space-y-4">
          <span className="eyebrow">{exam.subject}</span>
          <h1>{exam.title}</h1>
          <p className="flex flex-wrap items-center gap-2">
            <span className="badge border-mint-mist bg-card-mint font-mono !text-[13px] uppercase text-pine-shadow">
              {exam.durationMinutes} minutes
            </span>
            <span className="badge border-mint-mist bg-card-mint font-mono !text-[13px] uppercase text-pine-shadow">
              Webcam monitored
            </span>
          </p>
        </header>

        {exam.status !== 'active' ? (
          <EmptyState title="This examination is not open">
            {exam.status === 'scheduled'
              ? 'Your teacher has not started it yet. Come back when it opens.'
              : 'This examination has ended.'}
          </EmptyState>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-8">
              {exam.instructions.length > 0 && (
                <section className="card space-y-5">
                  <div className="space-y-2">
                    <span
                      className="eyebrow"
                      style={{ '--dot': '#16325a' } as React.CSSProperties}
                    >
                      Step 1
                    </span>
                    <h2>Instructions</h2>
                  </div>

                  <ol className="space-y-3">
                    {exam.instructions.map((line, index) => (
                      <li key={line} className="flex gap-4">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-mint-mist bg-paper-white font-mono text-sm font-semibold text-pine-shadow"
                        >
                          {index + 1}
                        </span>
                        <span className="pt-1">{line}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <ConsentNotice />
            </div>

            <div className="lg:sticky lg:top-6">
              <ExamSessionPanel
                examId={exam.id}
                durationMinutes={exam.durationMinutes}
              />
            </div>
          </div>
        )}
      </main>
    </>
  )
}
