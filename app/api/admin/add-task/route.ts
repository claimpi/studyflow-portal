import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} } } }
  )
}

async function verifyAdmin(sb: any) {
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null
  const { data: p } = await sb.from('profiles').select('role').eq('id', user.id).single()
  return ['admin','manager'].includes(p?.role || '') ? user : null
}

export async function POST(req: NextRequest) {
  try {
    const sb = await getAdminClient()
    const user = await verifyAdmin(sb)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    const body = await req.json()
    const { data: task, error } = await sb.from('tasks').insert({
      client_id: body.client_id, title: body.title, course: body.course || null,
      task_type: body.task_type || 'assignment',
      due_date: body.due_date ? new Date(body.due_date).toISOString() : null,
      instructions: body.instructions || null, priority: body.priority || 'normal', status: 'pending',
    }).select().single()
    if (error) throw new Error(error.message)
    return NextResponse.json({ task })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
