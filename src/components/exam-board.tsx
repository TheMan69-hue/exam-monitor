import type { CSSProperties, ReactNode } from 'react'
import type { Exam, ExamStatus } from '@/types'

const COLUMNS: {
  status: ExamStatus
  title: string
  hint: string
  color: string
}[] = [
  {
    status: 'scheduled',
    title: 'Scheduled',
    hint: 'Not open yet',
    color: '#d6aec1',
  },
  { status: 'active', title: 'Active', hint: 'Open now', color: '#65b8a2' },
  { status: 'ended', title: 'Ended', hint: 'Closed', color: '#a2cbcd' },
]

// Kanban-style board: one column per exam status. Each page decides what a
// card shows, so teachers and students share the same layout.
export function ExamBoard({
  exams,
  renderCard,
}: {
  exams: Exam[]
  renderCard: (exam: Exam) => ReactNode
}) {
  return (
    <div
      className="scroll-thin -mx-1 flex h-[calc(100dvh-28rem)] min-h-80 snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-1 pb-3"
      tabIndex={0}
      aria-label="Examination board. Scroll sideways to see every column."
    >
      {COLUMNS.map((column) => {
        const items = exams.filter((exam) => exam.status === column.status)

        return (
          <section
            key={column.status}
            aria-label={`${column.title} examinations`}
            style={{ '--dot': column.color } as CSSProperties}
            className="card flex h-full min-w-0 shrink-0 basis-[85%] snap-start flex-col gap-4 !p-4 sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]"
          >
            <header className="flex shrink-0 items-center justify-between gap-2 px-1">
              <div>
                <span className="eyebrow">{column.title}</span>
                <p className="mt-1 text-xs">{column.hint}</p>
              </div>
              <span className="badge border-mint-mist bg-paper-white font-mono text-pine-shadow">
                {items.length}
              </span>
            </header>

            {items.length === 0 ? (
              <p className="rounded-card border border-dashed border-mint-mist px-4 py-8 text-center text-sm text-pine-shadow">
                No {column.title.toLowerCase()} examinations
              </p>
            ) : (
              <ul className="scroll-thin -mr-1 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1">
                {items.map((exam) => (
                  <li
                    key={exam.id}
                    className="min-w-0 space-y-3 break-words rounded-card border border-sea-foam bg-paper-white p-4"
                  >
                    {renderCard(exam)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

export function ExamCardTitle({
  exam,
  note,
}: {
  exam: Exam
  note?: string
}) {
  return (
    <div className="space-y-1">
      <p className="font-medium leading-snug">{exam.title}</p>
      <p className="font-mono text-[13px] uppercase tracking-[0.04em] text-pine-shadow">
        {exam.durationMinutes} minutes
      </p>
      {note && <p className="text-xs">{note}</p>}
    </div>
  )
}
