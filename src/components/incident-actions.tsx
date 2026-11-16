import { setIncidentStatus } from '@/app/actions/incidents'
import type { IncidentStatus } from '@/types'

function ActionButton({
  incidentId,
  status,
  label,
  className,
}: {
  incidentId: string
  status: IncidentStatus
  label: string
  className: string
}) {
  return (
    <form action={setIncidentStatus}>
      <input type="hidden" name="incidentId" value={incidentId} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={`rounded px-4 py-2 text-sm ${className}`}>
        {label}
      </button>
    </form>
  )
}

export function IncidentActions({
  incidentId,
  status,
}: {
  incidentId: string
  status: IncidentStatus
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {status === 'pending' ? (
        <>
          <ActionButton
            incidentId={incidentId}
            status="reviewed"
            label="Mark as reviewed"
            className="bg-green-600 text-white hover:bg-green-700"
          />
          <ActionButton
            incidentId={incidentId}
            status="dismissed"
            label="Dismiss"
            className="bg-gray-700 text-white hover:bg-gray-800"
          />
        </>
      ) : (
        <ActionButton
          incidentId={incidentId}
          status="pending"
          label="Reopen"
          className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
        />
      )}
    </div>
  )
}