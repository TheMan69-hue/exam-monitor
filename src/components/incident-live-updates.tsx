'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { INCIDENT_TYPE_LABELS } from '@/lib/labels'
import type { IncidentType } from '@/types'

type Connection = 'connecting' | 'connected' | 'offline'

type Notice = {
  count: number
  studentName: string
  patternLabel: string
  simulated: boolean
}

const CONNECTION_TEXT: Record<Connection, string> = {
  connecting: 'Live updates: connecting…',
  connected: 'Live updates: connected',
  offline: 'Live updates: offline (use Refresh to check for new flags)',
}

const CONNECTION_DOT: Record<Connection, string> = {
  connecting: 'bg-mint-mist',
  connected: 'bg-sage',
  offline: 'bg-alert',
}

export function IncidentLiveUpdates() {
  const router = useRouter()
  const [connection, setConnection] = useState<Connection>('connecting')
  const [notice, setNotice] = useState<Notice | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let active = true
    let wasOffline = false
    let channel: RealtimeChannel | null = null

    // Several events close together cause only one refresh.
    function scheduleRefresh() {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(() => router.refresh(), 300)
    }

    async function start() {
      // Realtime follows RLS, so the subscription must use the teacher's token.
      const { data } = await supabase.auth.getSession()
      if (!active) return

      const token = data.session?.access_token
      if (!token) {
        setConnection('offline')
        return
      }

      void supabase.realtime.setAuth(token)

      channel = supabase
        .channel('teacher-incidents')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'incidents' },
          (payload) => {
            // Only safe display fields are read from the event.
            const row = payload.new as {
              student_name?: unknown
              type?: unknown
              source?: unknown
            }

            const studentName =
              typeof row.student_name === 'string' ? row.student_name : 'A student'
            const patternLabel =
              INCIDENT_TYPE_LABELS[row.type as IncidentType] ??
              'Possible suspicious behavior'

            // Count every new flag, and always keep the latest one visible.
            setNotice((previous) => ({
              count: (previous?.count ?? 0) + 1,
              studentName,
              patternLabel,
              simulated: row.source === 'simulated',
            }))

            // The database stays the source of truth for the list and counts.
            scheduleRefresh()
          }
        )
        .subscribe((status) => {
          if (!active) return

          const state = String(status)
          if (state === 'SUBSCRIBED') {
            setConnection('connected')
            // After a dropped connection, catch up on anything that was missed.
            if (wasOffline) {
              wasOffline = false
              scheduleRefresh()
            }
          } else if (
            state === 'CHANNEL_ERROR' ||
            state === 'TIMED_OUT' ||
            state === 'CLOSED'
          ) {
            wasOffline = true
            setConnection('offline')
          }
        })
    }

    void start()

    // Clean up when the teacher leaves the page.
    return () => {
      active = false
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [router])

  return (
    <div className="space-y-3">
      {notice && (
        <div
          role="status"
          className="notice flex flex-wrap items-center justify-between gap-3 !p-4"
        >
          <p>
            <span className="font-semibold">
              {notice.count === 1
                ? 'New flagged incident'
                : `${notice.count} new flagged incidents`}
            </span>
            {' — '}
            {notice.count > 1 && 'latest: '}
            {notice.studentName} · {notice.patternLabel}
            {notice.simulated ? ' (Simulated)' : ''}
          </p>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="btn btn-ghost btn-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <p role="status" className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.04em] text-pine-shadow">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 rounded-full ${CONNECTION_DOT[connection]}`}
        />
        {CONNECTION_TEXT[connection]}
      </p>
    </div>
  )
}