import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { type, clientId, clientEmail, clientName } = await req.json()
    const cookieStore = await cookies()
    const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} } } })
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
    const FROM = process.env.RESEND_FROM_EMAIL || 'StudyFlowHQ Portal <noreply@studyflowhq.com>'
    const ADMIN = 'info@studyflowhq.com'
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://portal.studyflowhq.com'

    if (type === 'new_enrollment' && clientId) {
      const { data: client } = await sb.from('portal_clients').select('*, profiles(full_name, email)').eq('id', clientId).single()
      if (client) {
        const profile = client.profiles as { full_name: string; email: string } | null
        const email = profile?.email || clientEmail || ''
        const name = profile?.full_name || clientName || 'Student'
        // Email admin
        await resend.emails.send({ from: FROM, to: ADMIN, subject: `🆕 New Portal Enrollment — ${client.university_name} · ${client.plan} plan`, html: `<div style="background:#070d1a;color:#EDF2F7;font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:0 auto"><h2 style="color:#63B3ED">New Enrollment Received</h2><p><strong>Student:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>University:</strong> ${client.university_name}</p><p><strong>Plan:</strong> ${client.plan} — $${client.price}</p><p><strong>Semester:</strong> ${client.semester}</p><a href="${SITE}/admin" style="display:inline-block;background:#63B3ED;color:#070d1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:800;margin-top:16px">View in Admin Portal →</a></div>` })
        // Email student
        if (email) await resend.emails.send({ from: FROM, to: email, subject: `✅ Enrollment Received — We'll contact you within 24 hours`, html: `<div style="background:#070d1a;color:#EDF2F7;font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:0 auto"><h2 style="color:#68D391">Enrollment Received!</h2><p>Hi ${name.split(' ')[0]},</p><p>We've received your portal enrollment for <strong>${client.university_name}</strong> (${client.semester}).</p><p>Our team will review your details and contact you within <strong>24 hours</strong> with payment instructions and your dedicated manager's contact.</p><a href="${SITE}/dashboard" style="display:inline-block;background:#68D391;color:#070d1a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:800;margin-top:16px">View My Dashboard →</a><p style="color:#718096;margin-top:24px;font-size:13px">Questions? Email us at <a href="mailto:${ADMIN}" style="color:#63B3ED">${ADMIN}</a></p></div>` })
      }
    }
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }
}
