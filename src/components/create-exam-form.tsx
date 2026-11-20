import { createExam } from '@/app/actions/exams'

export function CreateExamForm({
  subjects,
  defaultSubject,
  returnTo,
}: {
  subjects: string[]
  defaultSubject?: string
  returnTo: string
}) {
  return (
    <form action={createExam} className="card space-y-4">
      <span className="eyebrow">New examination</span>
      <input type="hidden" name="return_to" value={returnTo} />

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1 space-y-1.5">
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={120}
            className="input"
          />
        </div>

        <div className="w-52 space-y-1.5">
          <label htmlFor="subject" className="label">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={60}
            list="subject-options"
            defaultValue={defaultSubject}
            placeholder="e.g. Mathematics"
            className="input"
          />
          <datalist id="subject-options">
            {subjects.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
        </div>

        <div className="w-44 space-y-1.5">
          <label htmlFor="duration" className="label">
            Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            required
            min={1}
            max={600}
            step={1}
            defaultValue={60}
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </div>

      <p className="text-xs">
        New examinations start as Scheduled. Press Start when students may join.
      </p>
    </form>
  )
}
