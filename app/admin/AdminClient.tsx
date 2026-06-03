'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

const CLIENT_STATUS: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: '#F6AD55', bg: 'rgba(246,173,85,0.1)',   label: '⏳ Pending' },
  active:    { color: '#68D391', bg: 'rgba(104,211,145,0.1)',  label: '✅ Active' },
  paused:    { color: '#63B3ED', bg: 'rgba(99,179,237,0.1)',   label: '⏸ Paused' },
  completed: { color: '#68D391', bg: 'rgba(104,211,145,0.15)', label: '🎓 Completed' },
  cancelled: { color: '#FC8181', bg: 'rgba(252,129,129,0.1)',  label: '❌ Cancelled' },
}

const TASK_STATUS: Record<string, { color: string; bg: string }> = {
  pending:     { color: '#F6AD55', bg: 'rgba(246,173,85,0.1)' },
  in_progress: { color: '#63B3ED', bg: 'rgba(99,179,237,0.1)' },
  submitted:   { color: '#B794F4', bg: 'rgba(183,148,244,0.1)' },
  completed:   { color: '#68D391', bg: 'rgba(104,211,145,0.1)' },
  missed:      { color: '#FC8181', bg: 'rgba(252,129,129,0.1)' },
}

const TASK_TYPES = ['assignment','quiz','discussion','exam','project','other']

export default function AdminClient({ clients, tasks, users, stats }: {
  clients: any[]; tasks: any[]; users: any[]; stats: Record<string, any>
}) {
  const [tab, setTab] = useState<'clients'|'tasks'|'users'>('clients')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: 'success' })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [localClients, setLocalClients] = useState(clients)
  const [localTasks, setLocalTasks] = useState(tasks)
  const [updatingId, setUpdatingId] = useState('')

  // New task form
  const [newTask, setNewTask] = useState({
    title: '', course: '', task_type: 'assignment',
    due_date: '', instructions: '', priority: 'normal'
  })

  function showToast(msg: string, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 4000)
  }

  const filteredClients = localClients.filter(c => {
    const q = search.toLowerCase()
    const p = c.profiles as { full_name: string; email: string } | null
    const match = !q || c.university_name?.toLowerCase().includes(q) || p?.email?.toLowerCase().includes(q) || p?.full_name?.toLowerCase().includes(q) || c.student_name?.toLowerCase().includes(q)
    const statusMatch = filterStatus === 'all' || c.status === filterStatus
    return match && statusMatch
  })

  const clientTasks = selectedClient ? localTasks.filter(t => t.client_id === selectedClient.id) : []

  async function updateClientStatus(clientId: string, status: string) {
    setUpdatingId(clientId)
    try {
      const res = await fetch(`/api/admin/update-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, status }),
      })
      if (res.ok) {
        setLocalClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c))
        if (selectedClient?.id === clientId) setSelectedClient((p: any) => p ? { ...p, status } : null)
        showToast(`✅ Client status → "${status}"`)
      }
    } finally { setUpdatingId('') }
  }

  async function updatePaymentStatus(clientId: string, payment_status: string) {
    const res = await fetch('/api/admin/update-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, payment_status }),
    })
    if (res.ok) {
      setLocalClients(prev => prev.map(c => c.id === clientId ? { ...c, payment_status } : c))
      if (selectedClient?.id === clientId) setSelectedClient((p: any) => p ? { ...p, payment_status } : null)
      showToast('💰 Payment status updated')
    }
  }

  async function addTask() {
    if (!selectedClient || !newTask.title) return
    const res = await fetch('/api/admin/add-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, client_id: selectedClient.id }),
    })
    const data = await res.json()
    if (data.task) {
      setLocalTasks(prev => [...prev, data.task])
      setNewTask({ title: '', course: '', task_type: 'assignment', due_date: '', instructions: '', priority: 'normal' })
      setShowAddTask(false)
      showToast('📋 Task added successfully')
    } else { showToast('❌ Failed to add task', 'error') }
  }

  async function updateTaskStatus(taskId: string, status: string) {
    const res = await fetch('/api/admin/update-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, status }),
    })
    if (res.ok) {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
      showToast(`✅ Task → "${status}"`)
    }
  }

  async function updateTaskGrade(taskId: string, grade: string) {
    await fetch('/api/admin/update-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, grade }),
    })
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, grade } : t))
  }

  const inp: React.CSSProperties = { background: 'rgba(7,13,26,0.8)', border: '1.5px solid rgba(99,179,237,0.15)', borderRadius: 9, padding: '0.65rem 0.9rem', color: '#EDF2F7', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', outline: 'none', width: '100%' }

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: 'rgba(12,22,40,0.98)', borderBottom: '1px solid rgba(99,179,237,0.1)', padding: '0 1.5rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: '#070d1a' }}>S</div>
          <span style={{ fontWeight: 800, color: '#EDF2F7', fontSize: '1rem' }}>StudyFlowHQ <span style={{ color: '#63B3ED', fontSize: '0.68rem', fontWeight: 600 }}>PORTAL ADMIN</span></span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.82rem' }}>← Dashboard</Link>
          <Link href="/" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.82rem' }}>← Site</Link>
        </div>
      </nav>

      {/* Toast */}
      {toast.msg && (
        <div style={{ position: 'fixed', top: 66, left: '50%', transform: 'translateX(-50%)', background: '#0c1628', border: `1px solid ${toast.type === 'error' ? 'rgba(252,129,129,0.4)' : 'rgba(104,211,145,0.3)'}`, borderRadius: 10, padding: '0.7rem 1.5rem', color: toast.type === 'error' ? '#FC8181' : '#68D391', fontSize: '0.85rem', fontWeight: 600, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.75rem 1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {[
            { l: 'Total Clients', v: stats.totalClients, c: '#EDF2F7', i: '👥' },
            { l: 'Active', v: stats.activeClients, c: '#68D391', i: '✅' },
            { l: 'Pending Review', v: stats.pendingClients, c: '#F6AD55', i: '⏳' },
            { l: 'Total Tasks', v: stats.totalTasks, c: '#63B3ED', i: '📋' },
            { l: 'Tasks Pending', v: stats.pendingTasks, c: '#F6AD55', i: '🔔' },
            { l: 'Tasks Done', v: stats.completedTasks, c: '#68D391', i: '✓' },
            { l: 'Revenue', v: `$${stats.revenue}`, c: '#68D391', i: '💰' },
            { l: 'Users', v: stats.users, c: '#718096', i: '👤' },
          ].map(s => (
            <div key={s.l} style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 12, padding: '0.9rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{s.i}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.c, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div style={{ color: '#4A5568', fontSize: '0.65rem', marginTop: '0.15rem' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[['clients', `👥 Clients (${localClients.length})`], ['tasks', `📋 All Tasks (${localTasks.length})`], ['users', `👤 Users (${users.length})`]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)} style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: tab === t ? '1px solid rgba(99,179,237,0.3)' : '1px solid rgba(99,179,237,0.1)', background: tab === t ? 'rgba(99,179,237,0.1)' : 'transparent', color: tab === t ? '#63B3ED' : '#718096', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── CLIENTS TAB ── */}
        {tab === 'clients' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '1fr 420px' : '1fr', gap: '1.25rem' }}>

            {/* Client list */}
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, university..." style={{ ...inp, flex: 1, minWidth: 200 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 'auto' }}>
                  <option value="all">All Statuses</option>
                  {Object.entries(CLIENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              <div style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(99,179,237,0.08)', fontWeight: 700, fontSize: '0.88rem' }}>
                  {filteredClients.length} enrollments
                </div>

                {filteredClients.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#4A5568' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
                    <div>No enrollments yet. Share the site with students!</div>
                    <Link href="/" style={{ color: '#63B3ED', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem', marginTop: '0.75rem', display: 'inline-block' }}>Go to homepage →</Link>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                          {['Student','University','Plan','Semester','Price','Payment','Status','Tasks'].map(h => (
                            <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#718096', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map(c => {
                          const sc = CLIENT_STATUS[c.status] || CLIENT_STATUS.pending
                          const profile = c.profiles as { full_name: string; email: string } | null
                          const cTasks = localTasks.filter(t => t.client_id === c.id)
                          const doneTasks = cTasks.filter(t => t.status === 'completed').length
                          return (
                            <tr key={c.id} onClick={() => setSelectedClient(c)} style={{ borderBottom: '1px solid rgba(99,179,237,0.04)', cursor: 'pointer', background: selectedClient?.id === c.id ? 'rgba(99,179,237,0.04)' : 'transparent' }}>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#EDF2F7' }}>{profile?.full_name || c.student_name}</div>
                                <div style={{ color: '#4A5568', fontSize: '0.68rem' }}>{profile?.email}</div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#A0AEC0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.university_name}</td>
                              <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#63B3ED', fontWeight: 700, textTransform: 'capitalize' }}>{c.plan}</td>
                              <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#718096', whiteSpace: 'nowrap' }}>{c.semester}</td>
                              <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#68D391', fontWeight: 700 }}>${c.price}</td>
                              <td style={{ padding: '0.85rem 1rem' }} onClick={e => e.stopPropagation()}>
                                <select value={c.payment_status} onChange={e => updatePaymentStatus(c.id, e.target.value)}
                                  style={{ background: 'transparent', border: 'none', color: c.payment_status === 'paid' ? '#68D391' : '#F6AD55', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', outline: 'none' }}>
                                  <option value="pending">⏳ Unpaid</option>
                                  <option value="paid">✅ Paid</option>
                                  <option value="refunded">↩ Refunded</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }} onClick={e => e.stopPropagation()}>
                                <select value={c.status} onChange={e => updateClientStatus(c.id, e.target.value)} disabled={updatingId === c.id}
                                  style={{ ...inp, fontSize: '0.72rem', padding: '0.3rem 0.5rem', width: 'auto', cursor: 'pointer' }}>
                                  {Object.entries(CLIENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#68D391', fontWeight: 700 }}>{doneTasks}/{cTasks.length}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Client detail panel */}
            {selectedClient && (
              <div style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 14, height: 'fit-content', position: 'sticky', top: 66, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid rgba(99,179,237,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#EDF2F7', fontSize: '0.92rem' }}>{selectedClient.student_name}</div>
                    <div style={{ color: '#4A5568', fontSize: '0.72rem' }}>{(selectedClient.profiles as any)?.email}</div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} style={{ background: 'rgba(252,129,129,0.1)', border: 'none', color: '#FC8181', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                <div style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', padding: '1.1rem 1.25rem' }}>

                  {/* Details */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    {[
                      ['University', selectedClient.university_name],
                      ['Portal', selectedClient.portal_url],
                      ['Platform', selectedClient.lms_type || '—'],
                      ['Username', selectedClient.portal_username],
                      ['Semester', selectedClient.semester],
                      ['Dates', `${selectedClient.semester_start} → ${selectedClient.semester_end}`],
                      ['Plan', `${selectedClient.plan} — $${selectedClient.price}`],
                      ['Timezone', selectedClient.timezone],
                      ['Payment', selectedClient.payment_status],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(99,179,237,0.05)' }}>
                        <span style={{ color: '#718096', fontSize: '0.73rem' }}>{l}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#EDF2F7', maxWidth: '55%', textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Courses */}
                  {Array.isArray(selectedClient.courses) && selectedClient.courses.filter((c: any) => c.name).length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ color: '#718096', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Courses</div>
                      {selectedClient.courses.filter((c: any) => c.name).map((c: any, i: number) => (
                        <div key={i} style={{ background: 'rgba(99,179,237,0.04)', borderRadius: 7, padding: '0.5rem 0.75rem', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
                          <span style={{ color: '#EDF2F7', fontWeight: 600 }}>{c.name}</span>
                          {c.code && <span style={{ color: '#4A5568' }}> · {c.code}</span>}
                          {c.professor && <span style={{ color: '#718096' }}> · Prof. {c.professor}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special instructions */}
                  {selectedClient.instructions && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ color: '#718096', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Instructions</div>
                      <div style={{ background: 'rgba(99,179,237,0.03)', borderRadius: 8, padding: '0.75rem', fontSize: '0.78rem', color: '#A0AEC0', lineHeight: 1.5 }}>{selectedClient.instructions}</div>
                    </div>
                  )}

                  {/* Tasks section */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ color: '#718096', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Tasks ({clientTasks.length})
                      </div>
                      <button onClick={() => setShowAddTask(!showAddTask)} style={{ background: 'rgba(104,211,145,0.1)', border: '1px solid rgba(104,211,145,0.25)', color: '#68D391', borderRadius: 7, padding: '0.3rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                        {showAddTask ? 'Cancel' : '+ Add Task'}
                      </button>
                    </div>

                    {/* Add task form */}
                    {showAddTask && (
                      <div style={{ background: 'rgba(104,211,145,0.04)', border: '1px solid rgba(104,211,145,0.15)', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'grid', gap: '0.6rem' }}>
                          <input style={inp} value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Task title *" />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input style={inp} value={newTask.course} onChange={e => setNewTask({ ...newTask, course: e.target.value })} placeholder="Course name" />
                            <select style={inp} value={newTask.task_type} onChange={e => setNewTask({ ...newTask, task_type: e.target.value })}>
                              {TASK_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input style={inp} type="datetime-local" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                            <select style={inp} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                              {['low','normal','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                            </select>
                          </div>
                          <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} value={newTask.instructions} onChange={e => setNewTask({ ...newTask, instructions: e.target.value })} placeholder="Task instructions (optional)" />
                          <button onClick={addTask} style={{ background: 'linear-gradient(135deg,#68D391,#48BB78)', color: '#070d1a', border: 'none', borderRadius: 8, padding: '0.65rem', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                            Add Task
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Task list */}
                    {clientTasks.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#4A5568', fontSize: '0.8rem', padding: '1.25rem', background: 'rgba(99,179,237,0.02)', borderRadius: 8 }}>
                        No tasks yet — add the first task for this student
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {clientTasks.map(t => {
                          const ts = TASK_STATUS[t.status] || TASK_STATUS.pending
                          const isOverdue = t.due_date && new Date(t.due_date) < new Date() && !['completed','submitted'].includes(t.status)
                          return (
                            <div key={t.id} style={{ background: 'rgba(99,179,237,0.03)', border: `1px solid ${isOverdue ? 'rgba(252,129,129,0.2)' : 'rgba(99,179,237,0.08)'}`, borderRadius: 9, padding: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#EDF2F7' }}>{t.title}</div>
                                  <div style={{ color: '#4A5568', fontSize: '0.68rem' }}>
                                    {t.course}{t.due_date ? ` · Due ${new Date(t.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
                                    {isOverdue && <span style={{ color: '#FC8181', fontWeight: 700 }}> ⚠ OVERDUE</span>}
                                  </div>
                                </div>
                                <span style={{ background: ts.bg, color: ts.color, borderRadius: 100, padding: '0.15rem 0.55rem', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{t.status.replace('_',' ')}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)}
                                  style={{ ...inp, fontSize: '0.7rem', padding: '0.25rem 0.45rem', width: 'auto', flex: 1 }}>
                                  {Object.keys(TASK_STATUS).map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                                </select>
                                <input style={{ ...inp, fontSize: '0.7rem', padding: '0.25rem 0.45rem', width: 70 }} value={t.grade || ''} onChange={e => updateTaskGrade(t.id, e.target.value)} placeholder="Grade" onBlur={e => updateTaskGrade(t.id, e.target.value)} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {tab === 'tasks' && (
          <div style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(99,179,237,0.08)', fontWeight: 700 }}>All Tasks ({localTasks.length})</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                    {['Task','Course','Type','Due Date','Priority','Status','Grade'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#718096', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {localTasks.map(t => {
                    const ts = TASK_STATUS[t.status] || TASK_STATUS.pending
                    const isOverdue = t.due_date && new Date(t.due_date) < new Date() && !['completed','submitted'].includes(t.status)
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(99,179,237,0.04)' }}>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#EDF2F7' }}>{t.title}</td>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: '#718096' }}>{t.course || '—'}</td>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: '#63B3ED', textTransform: 'capitalize' }}>{t.task_type}</td>
                        <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: isOverdue ? '#FC8181' : '#718096', whiteSpace: 'nowrap', fontWeight: isOverdue ? 700 : 400 }}>
                          {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}{isOverdue ? ' ⚠' : ''}
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <span style={{ color: t.priority === 'urgent' ? '#FC8181' : t.priority === 'high' ? '#F6AD55' : '#718096', fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>{t.priority}</span>
                        </td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <select value={t.status} onChange={e => updateTaskStatus(t.id, e.target.value)}
                            style={{ background: ts.bg, border: 'none', color: ts.color, borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', outline: 'none', textTransform: 'capitalize' }}>
                            {Object.keys(TASK_STATUS).map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '0.8rem 1rem', color: '#68D391', fontSize: '0.82rem', fontWeight: 700 }}>{t.grade || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid rgba(99,179,237,0.08)', fontWeight: 700 }}>Users ({users.length})</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                    {['Name','Email','Role','Joined'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 1.25rem', textAlign: 'left', color: '#718096', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(99,179,237,0.04)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#EDF2F7' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#718096', fontSize: '0.8rem' }}>{u.email}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ background: u.role === 'admin' ? 'rgba(99,179,237,0.1)' : 'rgba(74,85,104,0.2)', color: u.role === 'admin' ? '#63B3ED' : '#718096', borderRadius: 100, padding: '0.15rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#718096', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
