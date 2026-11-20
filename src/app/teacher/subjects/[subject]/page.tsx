import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { getIncidents } from '@/lib/data/incidents'
import { findSubject, groupBySubject, subjectHref } from '@/lib/subjects'
import { AppHeader } from '@/components/app-header'
import { CreateExamForm } from '@/components/create-exam-form'
import { ExamControls } from '@/components/exam-controls'
import { ExamBoard, ExamCardTitle } from '@/components/exam-board'

export default async function TeacherSubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>
  searchParams: Promise<{ exam_error?: string }>
}) {
  const user = await requireRole('teacher')
  const { subject: subjectParam } = await params
  const { exam_error: examError } = await searchParams

  const [exams, incidents] = await Promise.all([getExams(), getIncidents()])

  const groups = groupBySubject(exams)
  const subject = findSubject(groups, subjectParam)
  if (!subject) notFound()

  const returnTo = subjectHref('/teacher', subject.name)

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Teacher'} role="teacher" />

      <main className="page space-y-10">
        <Link href="/teacher" className="btn btn-ghost btn-sm">
          ← All subjects
        </Link>

        <div className="space-y-3">
          <span className="eyebrow">Subject</span>
          <h1>{subject.name}</h1>
        </div>

        {examError && (
          <p role="alert" className="notice notice-alert">
            {examError}
          </p>
        )}

        <section className="space-y-4">
          <h2>Examinations</h2>

          <ExamBoard
            exams={subject.exams}
            renderCard={(exam) => {
              const pending = incidents.filter(
                (incident) =>
                  incident.examId === exam.id && incident.status === 'pending'
              ).length
              const isOwner = exam.teacherId === user.id

              return (
                <>
                  <ExamCardTitle
                    exam={exam}
                    note={!isOwner ? 'Created by another teacher' : undefined}
                  />

                  {exam.status === 'active' && (
                    <span className="badge border-dusty-rose bg-blush-sand text-charcoal-navy">
                      {pending} pending {pending === 1 ? 'flag' : 'flags'}
                    </span>
                  )}

                  {isOwner && exam.status !== 'ended' && (
                    <ExamControls
                      examId={exam.id}
                      status={exam.status}
                      returnTo={returnTo}
                    />
                  )}
                </>
              )
            }}
          />
        </section>

        <CreateExamForm
          subjects={groups.map((group) => group.name)}
          defaultSubject={subject.name}
          returnTo={returnTo}
        />
      </main>
    </>
  )
}
