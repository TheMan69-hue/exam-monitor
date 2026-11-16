import { DETECTION_CONFIG } from '@/lib/ai/config'
import type { Reading } from '@/lib/ai/types'
import type { Incident, IncidentType } from '@/types'

export type Flag = {
  type: IncidentType
  details: Incident['details']
}

// Turns a stream of readings into flags. One engine per monitoring session.
export function createFlaggingEngine() {
  const windowMs = DETECTION_CONFIG.windowSeconds * 1000
  const cooldownMs = DETECTION_CONFIG.cooldownSeconds * 1000

  let wasTurned = false
  let wasAway = false
  let cooldownUntil = 0

  let turns: { at: number; direction: 'left' | 'right'; peak: number }[] = []
  let awayEvents: number[] = []
  let samples: { at: number; away: boolean }[] = []

  function process(reading: Reading): Flag | null {
    const now = reading.timestamp
    const absYaw = Math.abs(reading.yawDegrees)
    const isTurned = absYaw >= DETECTION_CONFIG.headTurnYawDegrees

    // A "turn" is counted once, when the head first passes the threshold.
    if (isTurned && !wasTurned) {
      turns.push({
        at: now,
        direction: reading.yawDegrees < 0 ? 'left' : 'right',
        peak: absYaw,
      })
    } else if (isTurned && turns.length > 0) {
      const last = turns[turns.length - 1]
      last.peak = Math.max(last.peak, absYaw)
    }
    wasTurned = isTurned

    // A "look-away" is counted once, when the eyes first leave the screen.
    if (reading.gazeAway && !wasAway) {
      awayEvents.push(now)
    }
    wasAway = reading.gazeAway

    samples.push({ at: now, away: reading.gazeAway })

    // Forget anything older than the window.
    turns = turns.filter((turn) => now - turn.at <= windowMs)
    awayEvents = awayEvents.filter((time) => now - time <= windowMs)
    samples = samples.filter((sample) => now - sample.at <= windowMs)

    if (now < cooldownUntil) return null

    if (turns.length >= DETECTION_CONFIG.eventsToFlag) {
      const directions = new Set(turns.map((turn) => turn.direction))
      const flag: Flag = {
        type: 'head_turn',
        details: {
          occurrences: turns.length,
          windowSeconds: DETECTION_CONFIG.windowSeconds,
          direction: directions.size > 1 ? 'both' : turns[0].direction,
          maxYawDegrees: Math.round(Math.max(...turns.map((turn) => turn.peak))),
        },
      }
      turns = []
      awayEvents = []
      cooldownUntil = now + cooldownMs
      return flag
    }

    if (awayEvents.length >= DETECTION_CONFIG.eventsToFlag) {
      const awaySamples = samples.filter((sample) => sample.away).length
      const flag: Flag = {
        type: 'gaze_away',
        details: {
          occurrences: awayEvents.length,
          windowSeconds: DETECTION_CONFIG.windowSeconds,
          awayPercent: Math.round((100 * awaySamples) / samples.length),
        },
      }
      turns = []
      awayEvents = []
      cooldownUntil = now + cooldownMs
      return flag
    }

    return null
  }

  return { process }
}