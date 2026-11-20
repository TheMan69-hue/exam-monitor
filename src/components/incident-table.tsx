'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { INCIDENT_TYPE_LABELS } from '@/lib/labels'
import { formatDateTime } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'
import { SourceBadge } from '@/components/source-badge'
import { EmptyState } from '@/components/empty-state'
import type { IncidentSource, IncidentStatus, IncidentType } from '@/types'

export type IncidentRowData = {
  id: string
  studentName: string
  examTitle: string
  type: IncidentType
  source: IncidentSource
  status: IncidentStatus
  detectedAt: string
}

type StatusFilter = IncidentStatus | 'all'
type SourceFilter = IncidentSource | 'all'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'dismissed', label: 'Dismissed' },
]

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'All sources' },
  { value: 'simulated', label: 'Simulated' },
  { value: 'model', label: 'AI model' },
]

export function IncidentTable({ incidents }: { incidents: IncidentRowData[] }) {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [source, setSource] = useState<SourceFilter>('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return incidents.filter(
      (incident) =>
        (status === 'all' || incident.status === status) &&
        (source === 'all' || incident.source === source) &&
        (needle === '' ||
          incident.studentName.toLowerCase().includes(needle) ||
          incident.examTitle.toLowerCase().includes(needle))
    )
  }, [incidents, status, source, query])

  const filtering = status !== 'all' || source !== 'all' || query !== ''

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={status === option.value}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by source"
        >
          {SOURCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={source === option.value}
              onClick={() => setSource(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="min-w-[220px] flex-1">
          <label htmlFor="incident-search" className="sr-only">
            Search by student or examination
          </label>
          <input
            id="incident-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student or examination"
            className="input !py-2 !text-sm"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No matching flags">
          {filtering
            ? 'Try clearing a filter or changing the search.'
            : 'Nothing has been flagged yet.'}
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-sea-foam">
              <tr className="font-mono text-[13px] uppercase tracking-[0.05em] text-pine-shadow">
                <th className="p-3 pl-6 font-semibold">Student</th>
                <th className="p-3 font-semibold">Examination</th>
                <th className="p-3 font-semibold">Pattern</th>
                <th className="p-3 font-semibold">Time</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 pr-6 font-semibold">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-sea-foam last:border-b-0"
                >
                  <td className="p-3 pl-6">{incident.studentName}</td>
                  <td className="p-3">{incident.examTitle}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{INCIDENT_TYPE_LABELS[incident.type]}</span>
                      <SourceBadge source={incident.source} />
                    </div>
                  </td>
                  <td className="p-3">{formatDateTime(incident.detectedAt)}</td>
                  <td className="p-3">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="p-3 pr-6">
                    <Link
                      href={`/teacher/incidents/${incident.id}`}
                      className="font-medium underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
