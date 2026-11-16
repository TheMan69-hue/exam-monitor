import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type Role = 'student' | 'teacher'

export type CurrentUser = {
  id: string
  email: string | undefined
  role: Role
  fullName: string
}

// Returns the verified user and their role, or null if not logged in.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()

  // getClaims() verifies the token signature. Never trust getSession() here.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) return null

  // RLS only lets users read their own profile row.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', claims.sub)
    .single()

  if (!profile) return null

  return {
    id: claims.sub,
    email: claims.email as string | undefined,
    role: profile.role as Role,
    fullName: profile.full_name,
  }
}

// Call at the top of every protected page.
export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  if (user.role !== required) {
    redirect(user.role === 'teacher' ? '/teacher' : '/student')
  }

  return user
}