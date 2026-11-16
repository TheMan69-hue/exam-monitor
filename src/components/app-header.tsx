import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import type { Role } from '@/lib/auth/require-role'

export function AppHeader({ name, role }: { name: string; role: Role }) {
  const home = role === 'teacher' ? '/teacher' : '/student'

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href={home} className="font-semibold text-gray-900">
          Exam Monitor
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {name} ({role})
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded bg-gray-800 px-3 py-1.5 text-sm text-white hover:bg-gray-900"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}