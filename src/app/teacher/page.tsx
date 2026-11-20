import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { getIncidents } from '@/lib/data/incidents'
import { isToday } from '@/lib/format'
import { AppHeader } from '@/components/app-header'
import { IncidentTable } from '@/components/incident-table'
import { EmptyState } from '@/components/empty-state'
import { StatStrip } from '@/components/stat-strip'
import { TeacherRefreshButton } from '@/components/teacher-refresh-button'
import { CreateExamForm } from '@/components/create-exam-form'
import { SubjectCard } from '@/components/subject-card'
import { groupBySubject, subjectHref } from '@/lib/subjects'
import { IncidentLiveUpdates } from '@/components/incident-live-updates'

export default async function TeacherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ exam_error?: string }>
}) {
  const user = await requireRole('teacher')
  const { exam_error: examError } = await searchParams

  const [exams, incidents] = await Promise.all([getExams(), getIncidents()])

  const examTitles = new Map(exams.map((exam) => [exam.id, exam.title]))
  const subjects = groupBySubject(exams)

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Teacher'} role="teacher" />

      <main className="page space-y-14">
        <div className="space-y-3">
          <span className="eyebrow">Teacher</span>
          <h1>Teacher Dashboard</h1>
        </div>

        <IncidentLiveUpdates />

        <StatStrip
          stats={[
            {
              value: incidents.filter((i) => i.status === 'pending').length,
              label: 'pending',
            },
            {
              value: exams.filter((e) => e.status === 'active').length,
              label: 'exams active',
            },
            {
              value: incidents.filter((i) => isToday(i.detectedAt)).length,
              label: 'flags today',
            },
          ]}
        />

        <section className="space-y-4">
          <h2>Subjects</h2>

          {examError && (
            <p role="alert" className="notice notice-alert">
              {examError}
            </p>
          )}

          {subjects.length === 0 ? (
            <EmptyState title="No subjects yet">
              Create an examination below and give it a subject to start one.
            </EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => {
                const ids = new Set(subject.exams.map((exam) => exam.id))
                const pending = incidents.filter(
                  (incident) =>
                    ids.has(incident.examId) && incident.status === 'pending'
                ).length

                return (
                  <li key={subject.name} className="flex">
                    <div className="w-full">
                      <SubjectCard
                        href={subjectHref('/teacher', subject.name)}
                        name={subject.name}
                        examCount={subject.exams.length}
                        activeCount={
                          subject.exams.filter((e) => e.status === 'active')
                            .length
                        }
                        badge={
                          pending > 0 && (
                            <span className="badge border-dusty-rose bg-blush-sand text-charcoal-navy">
                              {pending} pending
                            </span>
                          )
                        }
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <CreateExamForm
            subjects={subjects.map((subject) => subject.name)}
            returnTo="/teacher"
          />
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2>Flagged incidents</h2>
            <TeacherRefreshButton />
          </div>
          <p className="max-w-2xl text-sm">
            These are possible suspicious behaviors detected by the system. Each
            one needs your review.
          </p>

          {incidents.length === 0 ? (
            <EmptyState title="No flagged incidents">
              When the system notices a pattern during an exam, it will show up
              here for your review.
            </EmptyState>
          ) : (
            <IncidentTable
              incidents={incidents.map((incident) => ({
                id: incident.id,
                studentName: incident.studentName,
                examTitle: examTitles.get(incident.examId) ?? 'Unknown exam',
                type: incident.type,
                source: incident.source,
                status: incident.status,
                detectedAt: incident.detectedAt,
              }))}
            />
          )}
        </section>
      </main>
    </>
  )
}
