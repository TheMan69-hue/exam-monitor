'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    fail('/login', 'Please enter your email and password.')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    fail('/login', 'Invalid email or password.')
  }

  // Read the assigned role from the profiles table.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    fail('/login', 'Your account has no profile. Please contact your teacher.')
  }

  redirect(profile.role === 'teacher' ? '/teacher' : '/student')
}

export async function register(formData: FormData) {
  const fullName = String(formData.get('full_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!fullName || !email || !password) {
    fail('/register', 'Please fill in all fields.')
  }

  if (password.length < 6) {
    fail('/register', 'Password must be at least 6 characters.')
  }

  const supabase = await createClient()

  // Only full_name is sent. The role is set to 'student' by the database trigger.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    fail('/register', error.message)
  }

  // With email confirmation off, a session is returned right away.
  if (!data.session) {
    fail('/login', 'Account created. Please log in.')
  }

  redirect('/student')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}