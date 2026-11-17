import { setExamStatus } from '@/app/actions/exams'
import type { ExamStatus } from '@/types'

export function ExamControls({
  examId,
  status,
}: {
  examId: string
  status: ExamStatus
}) {
  // Ended examinations cannot be restarted.
  if (status === 'ended') return null

  const isScheduled = status === 'scheduled'

  return (
    <form action={setExamStatus}>
      <input type="hidden" name="examId" value={examId} />
      <input
        type="hidden"
        name="status"
        value={isScheduled ? 'active' : 'ended'}
      />
      <button
        type="submit"
        className={`rounded px-4 py-2 text-sm text-white ${
          isScheduled
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-700 hover:bg-gray-800'
        }`}
      >
        {isScheduled ? 'Start exam' : 'End exam'}
      </button>
    </form>
  )
}