// PLACEHOLDER values for the prototype. They are NOT scientifically validated.
// They are only a starting point and will be tuned in Phase 5 when the real
// models are connected.
export const DETECTION_CONFIG = {
  headTurnYawDegrees: 30, // a head turn counts when it reaches this angle
  eventsToFlag: 4, // events needed within the window to raise a flag
  windowSeconds: 60,
  cooldownSeconds: 120, // minimum time between flags per student per exam
  simulatedSampleIntervalMs: 500,
} as const

// Simulation mode. Set NEXT_PUBLIC_SIMULATION=true in .env.local to enable it.
// It must be switched off (false or removed) before the final demonstration.
export const SIMULATION_ENABLED = process.env.NEXT_PUBLIC_SIMULATION === 'true'