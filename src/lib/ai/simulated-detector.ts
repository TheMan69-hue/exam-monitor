import { DETECTION_CONFIG } from '@/lib/ai/config'
import type { Detector, Reading } from '@/lib/ai/types'

type Step = { yawDegrees: number; gazeAway: boolean }

export type SimulatedBurstKind = 'head_turn' | 'gaze_away'

export interface SimulatedDetector extends Detector {
  // Queues a scripted suspicious pattern (demo tool only).
  triggerBurst(kind: SimulatedBurstKind): void
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function buildBurst(kind: SimulatedBurstKind): Step[] {
  const steps: Step[] = []

  // Five repetitions of: look forward, turn/look away (two samples), come back.
  for (let i = 0; i < 5; i++) {
    if (kind === 'head_turn') {
      const direction = i % 2 === 0 ? -1 : 1
      const angle = Math.round(direction * randomBetween(34, 42))
      steps.push(
        { yawDegrees: 0, gazeAway: false },
        { yawDegrees: angle, gazeAway: false },
        { yawDegrees: angle, gazeAway: false },
        { yawDegrees: 0, gazeAway: false }
      )
    } else {
      steps.push(
        { yawDegrees: 0, gazeAway: false },
        { yawDegrees: 0, gazeAway: true },
        { yawDegrees: 0, gazeAway: true },
        { yawDegrees: 0, gazeAway: false }
      )
    }
  }

  return steps
}

export function createSimulatedDetector(): SimulatedDetector {
  let timer: ReturnType<typeof setInterval> | null = null
  let emit: ((reading: Reading) => void) | null = null
  let script: Step[] = []

  function tick() {
    // Normal behavior: small head movements, eyes on screen.
    const step: Step = script.shift() ?? {
      yawDegrees: Math.round(randomBetween(-8, 8)),
      gazeAway: false,
    }

    emit?.({
      timestamp: Date.now(),
      yawDegrees: step.yawDegrees,
      gazeAway: step.gazeAway,
      source: 'simulated',
    })
  }

  return {
    start(onReading) {
      emit = onReading
      if (timer) return
      timer = setInterval(tick, DETECTION_CONFIG.simulatedSampleIntervalMs)
    },
    stop() {
      if (timer) clearInterval(timer)
      timer = null
      emit = null
      script = []
    },
    triggerBurst(kind) {
      script = buildBurst(kind)
    },
  }
}