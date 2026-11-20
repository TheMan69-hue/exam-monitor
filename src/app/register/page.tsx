import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Wordmark } from '@/components/brand'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Wordmark />

      <form action={register} className="card w-full max-w-md space-y-5 !p-8">
        <div className="space-y-2">
          <span className="eyebrow">New student</span>
          <h1>Create student account</h1>
        </div>

        {error && (
          <p role="alert" className="notice notice-alert">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="full_name" className="label">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            className="input"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="label">
            Password (at least 6 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="font-medium underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}
