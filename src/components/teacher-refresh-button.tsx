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
      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Refreshing…' : 'Refresh'}
    </button>
  )
}