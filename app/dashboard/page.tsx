export const dynamic = 'force-dynamic'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  pending:     { color: '#F6AD55', bg: 'rgba(246,173,85,0.1)',   label: '⏳ Pending Review' },
  active:      { color: '#68D391', bg: 'rgba(104,211,145,0.1)',  label: '✅ Active' },
  paused:      { color: '#63B3ED', bg: 'rgba(99,179,237,0.1)',   label: '⏸ Paused' },
  completed:   { color: '#68D391', bg: 'rgba(104,211,145,0.15)', label: '🎓 Completed' },
  cancelled:   { color: '#FC8181', bg: 'rgba(252,129,129,0.1)',  label: '❌ Cancelled' },
}

const TASK_STATUS: Record<string, { color: string; label: string }> = {
  pending:     { color: '#F6AD55', label: 'Pending' },
  in_progress: { color: '#63B3ED', label: 'In Progress' },
  submitted:   { color: '#B794F4', label: 'Submitted' },
  completed:   { color: '#68D391', label: 'Done' },
  missed:      { color: '#FC8181', label: 'Missed' },
}

export default async function DashboardPage() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin' || profile?.role === 'manager'

    const { data: clients } = await supabase.from('portal_clients').select('*')
      .eq(isAdmin ? 'id' : 'user_id', isAdmin ? clients?.[0]?.id || '' : user.id)
      .order('created_at', { ascending: false })

    // For non-admin: get their clients
    const { data: myClients } = isAdmin ? { data: [] } : await supabase
      .from('portal_clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })

    const allClients = isAdmin ? (clients || []) : (myClients || [])

    // Get tasks for all clients
    const clientIds = allClients.map((c: any) => c.id)
    const { data: tasks } = clientIds.length > 0
      ? await supabase.from('tasks').select('*').in('client_id', clientIds).order('due_date', { ascending: true })
      : { data: [] }

    const allTasks = tasks || []
    const upcomingTasks = allTasks.filter((t: any) => !['completed','missed'].includes(t.status)).slice(0, 5)
    const firstName = profile?.full_name?.split(' ')[0] || 'there'
    const F: React.CSSProperties = { fontFamily: 'Inter, sans-serif' }

    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: '#070d1a', ...F }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

            {/* Admin banner */}
            {isAdmin && (
              <div style={{ background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚡</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#EDF2F7', fontSize: '0.9rem' }}>Admin / Manager Account</div>
                    <div style={{ color: '#718096', fontSize: '0.78rem' }}>Manage all client enrollments and tasks</div>
                  </div>
                </div>
                <Link href="/admin" style={{ background: 'linear-gradient(135deg,#63B3ED,#4299E1)', color: '#070d1a', padding: '0.6rem 1.25rem', borderRadius: 9, fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>Open Admin Portal →</Link>
              </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#EDF2F7', marginBottom: '0.2rem' }}>
                  Hey {firstName} 👋
                </h1>
                <p style={{ color: '#718096', fontSize: '0.85rem' }}>
                  {allClients.length === 0 ? 'No active enrollments yet.' : `${allClients.length} enrollment${allClients.length > 1 ? 's' : ''} · ${allTasks.filter((t: any) => t.status === 'completed').length} tasks completed`}
                </p>
              </div>
              <Link href="/onboarding" style={{ background: 'linear-gradient(135deg,#68D391,#48BB78)', color: '#070d1a', padding: '0.65rem 1.4rem', borderRadius: 10, fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}>
                + New Enrollment
              </Link>
            </div>

            {allClients.length === 0 ? (
              /* Empty state */
              <div style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 20, padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>🎓</div>
                <h2 style={{ fontWeight: 800, color: '#EDF2F7', marginBottom: '0.5rem', fontSize: '1.25rem' }}>No enrollments yet</h2>
                <p style={{ color: '#718096', marginBottom: '2rem', fontSize: '0.9rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  Enroll your university portal and we'll handle assignments, submissions and deadlines for an entire semester.
                </p>
                <Link href="/onboarding" style={{ background: 'linear-gradient(135deg,#68D391,#48BB78)', color: '#070d1a', padding: '0.85rem 2.25rem', borderRadius: 10, fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}>
                  Enroll My Portal →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Enrollments */}
                {allClients.map((client: any) => {
                  const sc = STATUS_COLORS[client.status] || STATUS_COLORS.pending
                  const clientTasks = allTasks.filter((t: any) => t.client_id === client.id)
                  const doneTasks = clientTasks.filter((t: any) => t.status === 'completed').length
                  const pendingTasks = clientTasks.filter((t: any) => !['completed','missed'].includes(t.status)).length
                  const courses = Array.isArray(client.courses) ? client.courses : []

                  return (
                    <div key={client.id} style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 18, overflow: 'hidden' }}>
                      {/* Client header */}
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(99,179,237,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', color: '#070d1a', flexShrink: 0 }}>
                            {client.university_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#EDF2F7', fontSize: '0.95rem' }}>{client.university_name}</div>
                            <div style={{ color: '#718096', fontSize: '0.78rem' }}>{client.semester} · {client.plan?.charAt(0).toUpperCase() + client.plan?.slice(1)} Plan · ${client.price}/sem</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30`, borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700 }}>{sc.label}</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                        {[
                          { label: 'Tasks Done', value: doneTasks, color: '#68D391' },
                          { label: 'Upcoming', value: pendingTasks, color: '#63B3ED' },
                          { label: 'Courses', value: courses.filter((c: any) => c.name).length, color: '#B794F4' },
                          { label: 'Payment', value: client.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending', color: client.payment_status === 'paid' ? '#68D391' : '#F6AD55' },
                        ].map(s => (
                          <div key={s.label} style={{ padding: '1rem 1.25rem', textAlign: 'center', borderRight: '1px solid rgba(99,179,237,0.06)' }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                            <div style={{ color: '#4A5568', fontSize: '0.7rem', marginTop: '0.15rem' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Courses */}
                      {courses.filter((c: any) => c.name).length > 0 && (
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                          <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Enrolled Courses</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {courses.filter((c: any) => c.name).map((c: any, i: number) => (
                              <span key={i} style={{ background: 'rgba(99,179,237,0.07)', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 6, padding: '0.25rem 0.7rem', fontSize: '0.75rem', color: '#A0AEC0' }}>
                                {c.code ? `${c.code} · ` : ''}{c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recent tasks */}
                      {clientTasks.length > 0 && (
                        <div style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontSize: '0.68rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Recent Tasks</div>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {clientTasks.slice(0, 4).map((t: any) => {
                              const ts = TASK_STATUS[t.status] || TASK_STATUS.pending
                              const isOverdue = t.due_date && new Date(t.due_date) < new Date() && !['completed','submitted'].includes(t.status)
                              return (
                                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: 'rgba(99,179,237,0.03)', borderRadius: 8, border: `1px solid ${isOverdue ? 'rgba(252,129,129,0.15)' : 'rgba(99,179,237,0.06)'}` }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '0.85rem' }}>{t.task_type === 'quiz' ? '📋' : t.task_type === 'discussion' ? '💬' : t.task_type === 'exam' ? '📝' : '📄'}</span>
                                    <div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#EDF2F7' }}>{t.title}</div>
                                      <div style={{ fontSize: '0.7rem', color: '#4A5568' }}>{t.course}{t.due_date ? ` · Due ${new Date(t.due_date).toLocaleDateString()}` : ''}</div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isOverdue && <span style={{ fontSize: '0.65rem', color: '#FC8181', fontWeight: 700 }}>OVERDUE</span>}
                                    <span style={{ background: `${ts.color}15`, color: ts.color, borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.68rem', fontWeight: 700 }}>{ts.label}</span>
                                    {t.grade && <span style={{ color: '#68D391', fontSize: '0.75rem', fontWeight: 700 }}>{t.grade}</span>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Empty tasks */}
                      {clientTasks.length === 0 && client.status === 'active' && (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#4A5568', fontSize: '0.82rem' }}>
                          Your manager is setting up your portal. Tasks will appear here shortly.
                        </div>
                      )}

                      {/* Pending payment notice */}
                      {client.payment_status !== 'paid' && (
                        <div style={{ padding: '0.85rem 1.5rem', background: 'rgba(246,173,85,0.05)', borderTop: '1px solid rgba(246,173,85,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#F6AD55', fontSize: '0.8rem', fontWeight: 600 }}>⏳ Awaiting payment confirmation from our team</span>
                          <a href="mailto:info@studyflowhq.com" style={{ color: '#63B3ED', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}>Contact us →</a>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </>
    )
  } catch (err) {
    console.error('Dashboard error:', err)
    redirect('/auth/login')
  }
}
