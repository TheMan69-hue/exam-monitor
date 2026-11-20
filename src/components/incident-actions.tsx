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
      <button type="submit" className={`btn ${className}`}>
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
            className="btn-primary"
          />
          <ActionButton
            incidentId={incidentId}
            status="dismissed"
            label="Dismiss"
            className="btn-ghost"
          />
        </>
      ) : (
        <ActionButton
          incidentId={incidentId}
          status="pending"
          label="Reopen"
          className="btn-ghost"
        />
      )}
    </div>
  )
}
