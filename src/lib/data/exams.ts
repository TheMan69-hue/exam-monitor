import type { Exam } from '@/types'
import { mockExams } from '@/lib/mock/data'

// Phase 4: replace the bodies of these functions with Supabase queries.
// Keep the names and return types the same so pages don't change.

export async function getExams(): Promise<Exam[]> {
  return mockExams
}

export async function getExam(id: string): Promise<Exam | null> {
  return mockExams.find((exam) => exam.id === id) ?? null
}