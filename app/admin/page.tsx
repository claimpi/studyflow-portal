export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin','manager'].includes(profile.role)) redirect('/dashboard')

  const [{ data: clients }, { data: users }] = await Promise.all([
    supabase.from('portal_clients').select('*, profiles(full_name, email, avatar_url)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  ])

  const allClients = clients || []
  const clientIds = allClients.map((c: any) => c.id)

  const { data: tasks } = clientIds.length > 0
    ? await supabase.from('tasks').select('*').in('client_id', clientIds).order('due_date', { ascending: true })
    : { data: [] }

  const allTasks = tasks || []

  const stats = {
    totalClients: allClients.length,
    activeClients: allClients.filter((c: any) => c.status === 'active').length,
    pendingClients: allClients.filter((c: any) => c.status === 'pending').length,
    totalTasks: allTasks.length,
    pendingTasks: allTasks.filter((t: any) => t.status === 'pending').length,
    completedTasks: allTasks.filter((t: any) => t.status === 'completed').length,
    revenue: allClients.filter((c: any) => c.payment_status === 'paid').reduce((s: number, c: any) => s + (c.price || 0), 0),
    users: users?.length || 0,
  }

  return <AdminClient clients={allClients} tasks={allTasks} users={users || []} stats={stats} />
}
