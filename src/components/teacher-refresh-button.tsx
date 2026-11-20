'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function TeacherRefreshButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className="btn btn-ghost btn-sm"
    >
      {pending ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}
