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

const STATUS_TEXT: Record<Status, string> = {
  idle: 'Not monitoring',
  starting: 'Starting camera…',
  monitoring: SIMULATION_ENABLED
    ? 'Monitoring (SIMULATED detection, not real AI)'
    : 'Camera on (preview only, detection not connected yet)',
  error: 'Camera not available',
}

export function ExamSessionPanel({ examId }: { examId: string }) {
  const [consented, setConsented] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [flagNotice, setFlagNotice] = useState<string | null>(null)

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

      setStatus('monitoring')
    } catch (error) {
      releaseAll()
      setStatus('error')
      setErrorMessage(describeCameraError(error))
    }
  }

  function stopMonitoring() {
    releaseAll()
    setStatus('idle')
    setErrorMessage(null)
    setFlagNotice(null)
  }

  const busy = status === 'starting' || status === 'monitoring'

  return (
    <section className="space-y-4 rounded-lg border bg-white p-4">
      {SIMULATION_ENABLED && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Simulation mode is ON. Detections here are simulated and are not
          produced by the AI models.
        </p>
      )}

      <label className="flex items-start gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={consented}
          disabled={busy}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-1"
        />
        <span>
          I have read this notice and agree to have my webcam used for
          monitoring during this exam.
        </span>
      </label>

      <div
        className={`max-w-sm overflow-hidden rounded-lg bg-black ${
          status === 'monitoring' ? 'block' : 'hidden'
        }`}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="aspect-video w-full -scale-x-100 object-cover"
        />
      </div>

      {errorMessage && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {status === 'monitoring' ? (
          <button
            type="button"
            onClick={stopMonitoring}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Stop Monitoring
          </button>
        ) : (
          <button
            type="button"
            disabled={!consented || status === 'starting'}
            onClick={startMonitoring}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {status === 'starting' ? 'Starting…' : 'Start Monitoring'}
          </button>
        )}

        <span role="status" className="text-sm text-gray-700">
          Status: {STATUS_TEXT[status]}
        </span>
      </div>

      {SIMULATION_ENABLED && status === 'monitoring' && (
        <div className="space-y-2 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Demo tools (simulated, not real AI)</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => detectorRef.current?.triggerBurst('head_turn')}
              className="rounded border border-amber-400 bg-white px-3 py-1.5 hover:bg-amber-100"
            >
              Simulate repeated head turns
            </button>
            <button
              type="button"
              onClick={() => detectorRef.current?.triggerBurst('gaze_away')}
              className="rounded border border-amber-400 bg-white px-3 py-1.5 hover:bg-amber-100"
            >
              Simulate repeated looking away
            </button>
          </div>
          {flagNotice && <p role="status">{flagNotice}</p>}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Your camera preview is shown only on this screen. Video is not recorded
        or uploaded.
      </p>
    </section>
  )
}