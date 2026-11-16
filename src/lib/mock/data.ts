import type { Exam, Incident } from '@/types'

export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'Programming Fundamentals – Midterm Lab Exam',
    status: 'active',
    durationMinutes: 90,
    instructions: [
      'You may use the IDE installed on your computer.',
      'Do not communicate with classmates during the exam.',
      'Submit your work the way your teacher announces.',
    ],
  },
  {
    id: 'exam-2',
    title: 'Data Structures – Practical Exam',
    status: 'active',
    durationMinutes: 120,
    instructions: [
      'You may use the IDE installed on your computer.',
      'Only the resources your teacher allows may be used.',
      'Submit your work the way your teacher announces.',
    ],
  },
  {
    id: 'exam-3',
    title: 'Web Development – Final Lab',
    status: 'scheduled',
    durationMinutes: 150,
    instructions: [
      'You may use the IDE installed on your computer.',
      'Do not communicate with classmates during the exam.',
      'Submit your work the way your teacher announces.',
    ],
  },
]

// Seed data. The data layer copies this, so edits at runtime never change it.
export const mockIncidents: Omit<Incident, 'source'>[] = [
  {
    id: 'inc-1',
    examId: 'exam-1',
    studentName: 'Alex Rivera',
    type: 'head_turn',
    detectedAt: '2026-11-15T09:12:30+08:00',
    status: 'pending',
    details: {
      occurrences: 5,
      windowSeconds: 60,
      direction: 'left',
      maxYawDegrees: 38,
    },
  },
  {
    id: 'inc-2',
    examId: 'exam-1',
    studentName: 'Jamie Cruz',
    type: 'gaze_away',
    detectedAt: '2026-11-15T09:20:05+08:00',
    status: 'pending',
    details: {
      occurrences: 7,
      windowSeconds: 90,
      awayPercent: 45,
    },
  },
  {
    id: 'inc-3',
    examId: 'exam-1',
    studentName: 'Sam Dela Cruz',
    type: 'head_turn',
    detectedAt: '2026-11-15T09:31:48+08:00',
    status: 'reviewed',
    details: {
      occurrences: 4,
      windowSeconds: 45,
      direction: 'right',
      maxYawDegrees: 33,
    },
  },
  {
    id: 'inc-4',
    examId: 'exam-2',
    studentName: 'Taylor Santos',
    type: 'gaze_away',
    detectedAt: '2026-11-15T10:02:10+08:00',
    status: 'pending',
    details: {
      occurrences: 6,
      windowSeconds: 120,
      awayPercent: 38,
    },
  },
  {
    id: 'inc-5',
    examId: 'exam-2',
    studentName: 'Morgan Reyes',
    type: 'head_turn',
    detectedAt: '2026-11-15T10:15:22+08:00',
    status: 'dismissed',
    details: {
      occurrences: 3,
      windowSeconds: 40,
      direction: 'both',
      maxYawDegrees: 29,
    },
  },
]