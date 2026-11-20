'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { reportIncident } from '@/app/actions/incident-reports'
import { SIMULATION_ENABLED } from '@/lib/ai/config'
import { createFlaggingEngine, type Flag } from '@/lib/ai/flagging-rules'
import {
  createSimulatedDetector,
  type SimulatedDetector,
} from '@/lib/ai/simulated-detector'

type Status = 'idle' | 'starting' | 'monitoring' | 'error'

function describeCameraError(error: unknown): string {
  const name = error instanceof DOMException ? error.name : ''

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Camera access was blocked. Allow the camera for this site in your browser settings, then press Start Monitoring again. You can also speak with your teacher about an alternative arrangement.'
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this computer.'
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The camera could not be started. It may be in use by another app. Close other apps that use the camera and try again.'
    default:
      return 'The camera could not be started. Please try again.'
  }
}

const STATUS_DOT: Record<Status, string> = {
  idle: 'bg-mint-mist',
  starting: 'bg-dusty-rose',
  monitoring: 'bg-sage',
  error: 'bg-alert',
}

const STEPS = ['Agree', 'Camera', 'Monitoring']

const LOW_TIME_MS = 5 * 60_000

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function ExamSessionPanel({
  examId,
  durationMinutes,
}: {
  examId: string
  durationMinutes: number
}) {
  const [consented, setConsented] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [flagNotice, setFlagNotice] = useState<string | null>(null)
  // Display only: the countdown starts with monitoring and never ends the exam.
  const [deadline, setDeadline] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [confirmingStop, setConfirmingStop] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<SimulatedDetector | null>(null)
  const mountedRef = useRef(false)

  // Releases everything: the detector, every camera track, and the preview.
  const releaseAll = useCallback(() => {
    detectorRef.current?.stop()
    detectorRef.current = null

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Runs if the camera is unplugged or access is revoked while monitoring.
  const handleTrackEnded = useCallback(() => {
    releaseAll()
    setStatus('error')
    setErrorMessage(
      'The camera stopped working or was disconnected. Press Start Monitoring to try again.'
    )
  }, [releaseAll])

  // Tick the countdown only while monitoring is on.
  useEffect(() => {
    if (status !== 'monitoring') return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [status])

  // Ask before the student closes or reloads the tab mid-exam.
  useEffect(() => {
    if (status !== 'monitoring') return
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [status])

  // Turn everything off if the student leaves the page.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      releaseAll()
    }
  }, [releaseAll])

  async function sendFlag(flag: Flag) {
    try {
      const result = await reportIncident({
        examId,
        type: flag.type,
        details: flag.details,
      })
      if (mountedRef.current) setFlagNotice(result.message)
    } catch {
      if (mountedRef.current) setFlagNotice('The flag could not be sent.')
    }
  }

  async function startMonitoring() {
    if (!consented || status === 'starting' || status === 'monitoring') return

    setErrorMessage(null)
    setFlagNotice(null)
    setConfirmingStop(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setErrorMessage(
        'This browser or address cannot use the camera. Open the site at http://localhost:3000 or over HTTPS.'
      )
      return
    }

    setStatus('starting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })

      // The student may have left the page while the permission prompt was open.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      stream
        .getVideoTracks()
        .forEach((track) => track.addEventListener('ended', handleTrackEnded))

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }

      // Simulated detection only runs when simulation mode is on.
      if (SIMULATION_ENABLED) {
        const engine = createFlaggingEngine()
        const detector = createSimulatedDetector()
        detectorRef.current = detector
        detector.start((reading) => {
          const flag = engine.process(reading)
          if (flag) void sendFlag(flag)
        })
      }

      const startedAt = Date.now()
      setNow(startedAt)
      setDeadline(startedAt + durationMinutes * 60_000)
      setStatus('monitoring')
    } catch (error) {
      releaseAll()
      setStatus('error')
      setErrorMessage(describeCameraError(error))
    }
  }

  function stopMonitoring() {
    releaseAll()
    setConfirmingStop(false)
    setDeadline(null)
    setStatus('idle')
    setErrorMessage(null)
    setFlagNotice(null)
  }

  const busy = status === 'starting' || status === 'monitoring'
  const remainingMs =
    status === 'monitoring' && deadline !== null
      ? Math.max(0, deadline - now)
      : null
  const lowTime = remainingMs !== null && remainingMs <= LOW_TIME_MS
  const step = status === 'monitoring' ? 3 : consented ? 2 : 1

  return (
    <section className="card space-y-5" aria-label="Your exam session">
      <div className="flex items-center justify-between gap-3">
        <span
          className="eyebrow"
          style={{ '--dot': '#16325a' } as React.CSSProperties}
        >
          Step 3 · Your session
        </span>
        <span
          role="status"
          className="flex items-center gap-2 text-xs font-medium"
        >
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]} ${
              status === 'starting' ? 'animate-pulse' : ''
            }`}
          />
          {status === 'idle'
            ? 'Not monitoring'
            : status === 'starting'
              ? 'Starting camera…'
              : status === 'monitoring'
                ? 'Monitoring'
                : 'Camera not available'}
        </span>
      </div>

      {SIMULATION_ENABLED && (
        <p className="notice">
          Simulation mode is ON. Detections here are simulated and are not
          produced by the AI models.
        </p>
      )}

      <ol className="flex items-center gap-2" aria-label="Progress">
        {STEPS.map((label, index) => {
          const number = index + 1
          const done = number < step
          const current = number === step
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              className="flex flex-1 items-center gap-2 last:flex-none"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  done
                    ? 'border-deep-teal bg-deep-teal text-white'
                    : current
                      ? 'border-2 border-deep-teal bg-white text-deep-teal'
                      : 'border-mint-mist text-pine-shadow'
                }`}
              >
                {done ? '✓' : number}
              </span>
              <span
                className={`text-xs ${current ? 'font-semibold' : 'text-pine-shadow'}`}
              >
                {label}
              </span>
              {number < STEPS.length && (
                <span
                  aria-hidden="true"
                  className={`h-px flex-1 ${done ? 'bg-deep-teal' : 'bg-mint-mist'}`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <div className="relative aspect-video overflow-hidden rounded-card bg-illustration-ink">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className={`h-full w-full -scale-x-100 object-cover ${
            status === 'monitoring' ? 'block' : 'invisible'
          }`}
        />

        {status === 'monitoring' ? (
          <span className="badge absolute left-3 top-3 flex items-center gap-2 border-white/30 bg-illustration-ink/70 !text-[11px] uppercase tracking-[0.06em] text-white">
            <span className="h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
            Preview only
          </span>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-sea-foam">
            <span aria-hidden="true" className="text-3xl">
              ◔
            </span>
            <p>
              {status === 'starting'
                ? 'Waiting for camera permission…'
                : 'Your camera is off. The preview appears here once monitoring starts.'}
            </p>
          </div>
        )}
      </div>

      {status === 'monitoring' && (
        <p className="-mt-2 text-xs">
          {SIMULATION_ENABLED
            ? 'Monitoring with SIMULATED detection, not real AI.'
            : 'Camera on (preview only, detection not connected yet).'}
        </p>
      )}

      <div
        className={`flex items-baseline justify-between gap-3 rounded-card border px-4 py-3 ${
          lowTime
            ? 'border-dusty-rose bg-blush-sand'
            : 'border-sea-foam bg-paper-white'
        }`}
      >
        <span className="font-mono text-[13px] uppercase tracking-[0.05em] text-pine-shadow">
          {remainingMs === null ? 'Duration' : 'Time left'}
        </span>
        <span
          className="font-mono text-2xl font-semibold tabular-nums"
          aria-live="off"
        >
          {remainingMs === null
            ? `${durationMinutes} min`
            : remainingMs === 0
              ? 'Time is up'
              : formatRemaining(remainingMs)}
        </span>
      </div>

      <label
        className={`flex items-start gap-3 rounded-card border p-4 text-sm ${
          consented
            ? 'border-deep-teal bg-paper-white'
            : 'border-mint-mist bg-white'
        } ${busy ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <input
          type="checkbox"
          checked={consented}
          disabled={busy}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-deep-teal"
        />
        <span>
          I have read the notice and agree to have my webcam used for monitoring
          during this exam.
        </span>
      </label>

      {errorMessage && (
        <p role="alert" className="notice notice-alert">
          {errorMessage}
        </p>
      )}

      {status === 'monitoring' ? (
        confirmingStop ? (
          <div className="notice space-y-3">
            <p className="font-medium">Stop monitoring?</p>
            <p>Your camera will turn off and the timer will reset.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={stopMonitoring}
                className="btn btn-navy btn-sm flex-1"
              >
                Yes, stop
              </button>
              <button
                type="button"
                onClick={() => setConfirmingStop(false)}
                className="btn btn-ghost btn-sm flex-1"
              >
                Keep going
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingStop(true)}
            className="btn btn-ghost w-full"
          >
            Stop monitoring
          </button>
        )
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={!consented || status === 'starting'}
            onClick={startMonitoring}
            className="btn btn-primary w-full"
          >
            {status === 'starting'
              ? 'Starting…'
              : status === 'error'
                ? 'Try again'
                : 'Start monitoring'}
          </button>
          {!consented && (
            <p className="text-center text-xs">
              Tick the box above to enable the start button.
            </p>
          )}
        </div>
      )}

      {SIMULATION_ENABLED && status === 'monitoring' && (
        <details className="notice">
          <summary className="cursor-pointer font-medium">
            Demo tools (simulated, not real AI)
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => detectorRef.current?.triggerBurst('head_turn')}
              className="btn btn-ghost btn-sm"
            >
              Simulate repeated head turns
            </button>
            <button
              type="button"
              onClick={() => detectorRef.current?.triggerBurst('gaze_away')}
              className="btn btn-ghost btn-sm"
            >
              Simulate repeated looking away
            </button>
          </div>
          {flagNotice && (
            <p role="status" className="mt-3">
              {flagNotice}
            </p>
          )}
        </details>
      )}

      <p className="text-xs">
        Your camera preview is shown only on this screen. Video is not recorded
        or uploaded.
      </p>
    </section>
  )
}
