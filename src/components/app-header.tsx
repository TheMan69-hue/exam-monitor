import { logout } from '@/app/actions/auth'
import type { Role } from '@/lib/auth/require-role'
import { Wordmark } from '@/components/brand'

export function AppHeader({ name, role }: { name: string; role: Role }) {
  const home = role === 'teacher' ? '/teacher' : '/student'

  return (
    <header className="px-6 pt-4">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 rounded-nav border border-sea-foam bg-card-mint px-6 py-3">
        <Wordmark href={home} />

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="eyebrow !text-xs !gap-1.5 text-pine-shadow">{role}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="btn btn-ghost btn-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
