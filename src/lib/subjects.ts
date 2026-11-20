import type { Exam } from '@/types'

export const MAX_SUBJECT_LENGTH = 60

export type SubjectGroup = {
  name: string
  exams: Exam[]
}

// Trims and collapses whitespace so "Math " and "Math" are the same subject.
export function normalizeSubject(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

function subjectKey(name: string): string {
  return normalizeSubject(name).toLowerCase()
}

// Subjects match without regard to letter case; the first spelling seen is shown.
export function groupBySubject(exams: Exam[]): SubjectGroup[] {
  const groups = new Map<string, SubjectGroup>()

  for (const exam of exams) {
    const key = subjectKey(exam.subject)
    const group = groups.get(key)
    if (group) group.exams.push(exam)
    else groups.set(key, { name: normalizeSubject(exam.subject), exams: [exam] })
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function subjectHref(base: '/teacher' | '/student', name: string): string {
  return `${base}/subjects/${encodeURIComponent(name)}`
}

// Route params arrive URL-encoded; a malformed value simply matches nothing.
export function findSubject(
  groups: SubjectGroup[],
  param: string
): SubjectGroup | null {
  let decoded: string
  try {
    decoded = decodeURIComponent(param)
  } catch {
    return null
  }
  const key = subjectKey(decoded)
  return groups.find((group) => subjectKey(group.name) === key) ?? null
}

const SUBJECT_ACCENTS = ['#65b8a2', '#d6aec1', '#2a7779', '#16325a', '#a2cbcd']

// The same subject name always gets the same palette color.
export function subjectAccent(name: string): string {
  let hash = 0
  for (const char of subjectKey(name)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return SUBJECT_ACCENTS[hash % SUBJECT_ACCENTS.length]
}
