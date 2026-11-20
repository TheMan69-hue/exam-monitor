import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/require-role'
import {
  StudentIllustration,
  TeacherIllustration,
  Wordmark,
} from '@/components/brand'

export default async function Home() {
  const user = await getCurrentUser()

  if (user) redirect(user.role === 'teacher' ? '/teacher' : '/student')

  return (
    <>
      <header className="px-6 pt-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between rounded-nav border border-sea-foam bg-card-mint px-6 py-3">
          <Wordmark />
          <Link href="/login" className="btn btn-ghost btn-sm">
            Log in
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-16 md:grid-cols-[1fr_minmax(0,640px)_1fr] md:py-24">
          <StudentIllustration className="hidden w-full max-w-[240px] justify-self-start md:block" />

          <div className="flex flex-col items-center gap-6 text-center">
            <span className="eyebrow">Exam monitoring, teacher-led</span>
            <h1 className="!text-[clamp(40px,6vw,64px)]">
              Fair exams, with a human{' '}
              <em className="font-bold italic">in the loop</em>.
            </h1>
            <p className="max-w-xl text-lg text-charcoal-navy">
              Exam Monitor notices patterns that may need a second look and
              hands them to your teacher to review. A flag is a possibility,
              never a verdict, and nothing is penalized automatically.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-primary">
                Create student account
              </Link>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
            </div>
          </div>

          <TeacherIllustration className="hidden w-full max-w-[240px] justify-self-end md:block" />
        </section>

        <section
          aria-label="Our approach"
          className="border-y border-card-mint bg-paper-white"
        >
          <ul className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-6 font-mono text-sm uppercase tracking-[0.04em]">
            <li>
              <b className="font-semibold">No video</b> recorded or uploaded
            </li>
            <li aria-hidden="true" className="text-mint-mist">
              |
            </li>
            <li>
              <b className="font-semibold">Every flag</b> reviewed by a teacher
            </li>
            <li aria-hidden="true" className="text-mint-mist">
              |
            </li>
            <li>
              <b className="font-semibold">No automatic</b> penalties
            </li>
          </ul>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-[88px]">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="card space-y-5 !p-8">
              <span className="eyebrow">For students</span>
              <h2>Know exactly what is watched</h2>
              <ul className="checklist">
                <li>Read a plain-language notice before you begin</li>
                <li>Consent first: you start monitoring yourself</li>
                <li>Your camera preview stays on your own screen</li>
              </ul>
              <Link href="/register" className="btn btn-primary">
                Create student account
              </Link>
            </article>

            <article className="card space-y-5 !p-8">
              <span className="eyebrow" style={{ '--dot': '#16325a' } as React.CSSProperties}>
                For teachers
              </span>
              <h2>Review flags as they arrive</h2>
              <ul className="checklist">
                <li>Create, start and end examinations</li>
                <li>Live notices when a new flag comes in</li>
                <li>Mark reviewed, dismiss, or reopen with one click</li>
              </ul>
              <Link href="/login" className="btn btn-navy">
                Teacher log in
              </Link>
            </article>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-sea-foam px-6 py-8 text-center text-sm text-charcoal-navy">
        Exam Monitor · Flags indicate possible behavior only. Teachers decide.
      </footer>
    </>
  )
}
