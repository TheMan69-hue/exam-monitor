export type ExamStatus = 'scheduled' | 'active' | 'ended'

export type Exam = {
  id: string
  title: string
  status: ExamStatus
  durationMinutes: number
  instructions: string[]
}

export type IncidentType = 'head_turn' | 'gaze_away'

export type IncidentStatus = 'pending' | 'reviewed' | 'dismissed'

export type IncidentSource = 'simulated' | 'model'
export type Incident = {
  id: string
  examId: string
  studentName: string
  type: IncidentType
  detectedAt: string // ISO date-time
  status: IncidentStatus
  source: IncidentSource 
  details: {
    occurrences: number // how many times the pattern happened
    windowSeconds: number // within how many seconds
    direction?: 'left' | 'right' | 'both' // for head turns
    maxYawDegrees?: number // largest head turn angle seen
    awayPercent?: number // share of the window the eyes were off-screen
  }
}