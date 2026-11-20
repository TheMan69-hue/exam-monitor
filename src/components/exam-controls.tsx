import { setExamStatus } from '@/app/actions/exams'
import type { ExamStatus } from '@/types'

export function ExamControls({
  examId,
  status,
  returnTo,
}: {
  examId: string
  status: ExamStatus
  returnTo: string
}) {
  // Ended examinations cannot be restarted.
  if (status === 'ended') return null

  const isScheduled = status === 'scheduled'

  return (
    <form action={setExamStatus}>
      <input type="hidden" name="examId" value={examId} />
      <input type="hidden" name="return_to" value={returnTo} />
      <input
        type="hidden"
        name="status"
        value={isScheduled ? 'active' : 'ended'}
      />
      <button
        type="submit"
        className={`btn ${isScheduled ? 'btn-primary' : 'btn-navy'}`}
      >
        {isScheduled ? 'Start exam' : 'End exam'}
      </button>
    </form>
  )
}
