import { createClient } from '@/lib/supabase/server'
import type { Exam, ExamStatus } from '@/types'

// Rows as they are stored in the database (snake_case).
type ExamRow = {
  id: string
  teacher_id: string
  title: string
  duration_minutes: number
  instructions: string[] | null
  status: string
}

const EXAM_COLUMNS =
  'id, teacher_id, title, duration_minutes, instructions, status'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toExam(row: ExamRow): Exam {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title,
    status: row.status as ExamStatus,
    durationMinutes: row.duration_minutes,
    instructions: row.instructions ?? [],
  }
}

// All of these use the signed-in user's own session, so the RLS rules apply.

export async function getExams(): Promise<Exam[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exams')
    .select(EXAM_COLUMNS)
    .order('created_at', { ascending: false })
    .order('title', { ascending: true })

  if (error) throw new Error(`Could not load exams: ${error.message}`)

  return (data as ExamRow[]).map(toExam)
}

export async function getExam(id: string): Promise<Exam | null> {
  // A malformed id can never match, so treat it as "not found".
  if (!UUID_PATTERN.test(id)) return null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exams')
    .select(EXAM_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`Could not load the exam: ${error.message}`)

  return data ? toExam(data as ExamRow) : null
}

export async function createExam(
  teacherId: string,
  input: { title: string; durationMinutes: number }
): Promise<Exam> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exams')
    .insert({
      teacher_id: teacherId,
      title: input.title,
      duration_minutes: input.durationMinutes,
    })
    .select(EXAM_COLUMNS)
    .single()

  if (error || !data) {
    throw new Error(`Could not create the exam: ${error?.message ?? 'no data'}`)
  }

  return toExam(data as ExamRow)
}

// Changes the status only if the exam belongs to this teacher AND is still in
// the expected current status. Returns false if nothing was changed.
export async function updateExamStatus(
  teacherId: string,
  examId: string,
  from: ExamStatus,
  to: ExamStatus
): Promise<boolean> {
  if (!UUID_PATTERN.test(examId)) return false

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('exams')
    .update({ status: to })
    .eq('id', examId)
    .eq('teacher_id', teacherId)
    .eq('status', from)
    .select('id')

  if (error) throw new Error(`Could not update the exam: ${error.message}`)

  return (data?.length ?? 0) > 0
}