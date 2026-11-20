import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Wordmark } from '@/components/brand'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Wordmark />

      <form action={login} className="card w-full max-w-md space-y-5 !p-8">
        <div className="space-y-2">
          <span className="eyebrow">Welcome back</span>
          <h1>Log in</h1>
        </div>

        {error && (
          <p role="alert" className="notice notice-alert">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Log in
        </button>

        <p className="text-center text-sm">
          New student?{' '}
          <Link href="/register" className="font-medium underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  )
}
