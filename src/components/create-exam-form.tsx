import { createExam } from '@/app/actions/exams'

export function CreateExamForm() {
  return (
    <form
      action={createExam}
      className="space-y-3 rounded-lg border bg-white p-4"
    >
      <h3 className="text-base font-medium text-gray-900">
        Create an examination
      </h3>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1 space-y-1">
          <label htmlFor="title" className="text-sm text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={120}
            className="w-full rounded border border-gray-300 p-2 text-gray-900"
          />
        </div>

        <div className="w-40 space-y-1">
          <label htmlFor="duration" className="text-sm text-gray-700">
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
            className="w-full rounded border border-gray-300 p-2 text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      <p className="text-xs text-gray-500">
        New examinations start as Scheduled. Press Start when students may join.
      </p>
    </form>
  )
}