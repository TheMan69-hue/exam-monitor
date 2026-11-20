'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Shows ?notice=... once, then removes it from the address bar.
export function Toaster() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  const notice = searchParams.get('notice')

  useEffect(() => {
    if (!notice) return

    const timer = setTimeout(() => {
      setMessage(notice)

      const rest = new URLSearchParams(searchParams.toString())
      rest.delete('notice')
      const query = rest.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [notice, pathname, router, searchParams])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div role="status" className="toast">
      <span aria-hidden="true" className="text-deep-teal">
        ✓
      </span>
      {message}
    </div>
  )
}
