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
    const { clientId, ...updates } = body
    delete updates.id
    await sb.from('portal_clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', clientId)
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
