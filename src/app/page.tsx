import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/require-role'

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  redirect(user.role === 'teacher' ? '/teacher' : '/student')
}