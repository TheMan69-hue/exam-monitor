import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { subjectAccent } from '@/lib/subjects'

// One subject on a dashboard. Exams are listed on the subject's own page.
export function SubjectCard({
  href,
  name,
  examCount,
  activeCount,
  badge,
}: {
  href: string
  name: string
  examCount: number
  activeCount: number
  badge?: ReactNode
}) {
  const accent = subjectAccent(name)

  return (
    <Link
      href={href}
      style={{ '--accent': accent, '--dot': accent } as CSSProperties}
      className="card card-accent group flex min-h-40 flex-col justify-between gap-6 text-charcoal-navy no-underline transition-colors hover:bg-sea-foam"
    >
      <div className="space-y-3">
        <span className="eyebrow">Subject</span>
        <p className="font-serif text-[30px] leading-[1.2]">{name}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[13px] uppercase tracking-[0.04em] text-pine-shadow">
          {examCount} {examCount === 1 ? 'exam' : 'exams'}
          {activeCount > 0 && ` · ${activeCount} active`}
        </p>
        <div className="flex items-center gap-3">
          {badge}
          <span aria-hidden="true" className="text-xl text-deep-teal">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
