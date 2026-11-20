import { requireRole } from '@/lib/auth/require-role'
import { getExams } from '@/lib/data/exams'
import { groupBySubject, subjectHref } from '@/lib/subjects'
import { AppHeader } from '@/components/app-header'
import { SubjectCard } from '@/components/subject-card'
import { EmptyState } from '@/components/empty-state'

export default async function StudentDashboard() {
  const user = await requireRole('student')
  const exams = await getExams()
  const subjects = groupBySubject(exams)

  return (
    <>
      <AppHeader name={user.fullName || user.email || 'Student'} role="student" />

      <main className="page space-y-10">
        <div className="space-y-3">
          <span className="eyebrow">Student</span>
          <h1>Student Dashboard</h1>
        </div>

        <section className="space-y-4">
          <h2>Subjects</h2>

          {subjects.length === 0 ? (
            <EmptyState title="No examinations yet">
              Your teacher has not added any examinations. Check back soon.
            </EmptyState>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <li key={subject.name} className="flex">
                  <div className="w-full">
                    <SubjectCard
                      href={subjectHref('/student', subject.name)}
                      name={subject.name}
                      examCount={subject.exams.length}
                      activeCount={
                        subject.exams.filter((exam) => exam.status === 'active')
                          .length
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
