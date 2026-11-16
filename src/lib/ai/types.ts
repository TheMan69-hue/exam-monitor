// Minimal shape of one head/eye reading. Phase 5 may adjust this once the real
// model outputs are confirmed. Nothing here assumes how 6DRepNet or the second
// model report their results.
export type Reading = {
  timestamp: number // milliseconds since epoch
  yawDegrees: number // negative = left, positive = right
  gazeAway: boolean // true while the eyes are estimated to be off the screen
  source: 'simulated' | 'model'
}

// Anything that produces readings (simulated now, a real model later).
export interface Detector {
  start(onReading: (reading: Reading) => void): void
  stop(): void
}