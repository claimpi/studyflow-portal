'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { encrypt } from '@/lib/encrypt'

const PLANS = [
  { id: 'basic', name: 'Basic', price: 300, courses: '1–2 courses', color: '#63B3ED' },
  { id: 'standard', name: 'Standard', price: 500, courses: '3–4 courses', color: '#68D391' },
  { id: 'premium', name: 'Premium', price: 800, courses: '5+ courses', color: '#B794F4' },
]

const LMS = ['Canvas','Blackboard','Moodle','D2L Brightspace','Sakai','Desire2Learn','Custom Portal']
const TIMEZONES = ['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','Europe/London','Europe/Dublin','Pacific/Auckland']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    // Step 1 — Plan
    plan: 'standard',
    // Step 2 — Portal credentials
    university_name: '',
    portal_url: '',
    lms_type: 'Canvas',
    portal_username: '',
    portal_password: '',
    student_name: '',
    student_id: '',
    timezone: 'America/New_York',
    // Step 3 — Semester info
    semester: '',
    semester_start: '',
    semester_end: '',
    courses: [{ name: '', code: '', professor: '' }],
    instructions: '',
  })

  const selectedPlan = PLANS.find(p => p.id === form.plan)!

  function updateCourse(i: number, field: string, value: string) {
    const updated = [...form.courses]
    updated[i] = { ...updated[i], [field]: value }
    setForm({ ...form, courses: updated })
  }

  function addCourse() {
    setForm({ ...form, courses: [...form.courses, { name: '', code: '', professor: '' }] })
  }

  function removeCourse(i: number) {
    setForm({ ...form, courses: form.courses.filter((_, idx) => idx !== i) })
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?redirect=/onboarding'); return }

      const { data, error: dbErr } = await supabase.from('portal_clients').insert({
        user_id: user.id,
        university_name: form.university_name,
        portal_url: form.portal_url,
        portal_username: form.portal_username,
        portal_password_encrypted: encrypt(form.portal_password),
        student_name: form.student_name,
        student_id: form.student_id,
        timezone: form.timezone,
        semester: form.semester,
        semester_start: form.semester_start,
        semester_end: form.semester_end,
        plan: form.plan,
        price: selectedPlan.price,
        courses: form.courses,
        instructions: form.instructions,
        status: 'pending',
        payment_status: 'pending',
      }).select().single()

      if (dbErr || !data) throw new Error(dbErr?.message || 'Failed to create enrollment')

      // Notify admin
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_enrollment', clientId: data.id }),
      }).catch(console.error)

      router.push(`/dashboard?enrolled=true`)
    } catch (err) {
      setError(String(err))
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(7,13,26,0.8)', border: '1.5px solid rgba(99,179,237,0.15)', borderRadius: 10, padding: '0.8rem 1rem', color: '#EDF2F7', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }
  const lbl: React.CSSProperties = { display: 'block', color: '#718096', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }
  const card: React.CSSProperties = { background: '#0c1628', border: '1px solid rgba(99,179,237,0.12)', borderRadius: 16, padding: '1.75rem' }

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', fontFamily: 'Inter, sans-serif', padding: '0 0 4rem' }}>

      {/* Header */}
      <div style={{ background: 'rgba(12,22,40,0.8)', borderBottom: '1px solid rgba(99,179,237,0.1)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: '#070d1a' }}>S</div>
          <span style={{ fontWeight: 800, color: '#EDF2F7', fontSize: '0.95rem' }}>StudyFlow<span style={{ color: '#63B3ED' }}>HQ</span></span>
        </Link>
        <span style={{ color: '#4A5568' }}>›</span>
        <span style={{ color: '#718096', fontSize: '0.88rem' }}>New Enrollment</span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Enroll Your Portal
          </h1>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>Secure · Confidential · Active within 24 hours</p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[{ n: 1, l: 'Choose Plan' }, { n: 2, l: 'Portal Access' }, { n: 3, l: 'Semester Details' }, { n: 4, l: 'Confirm' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step > s.n ? '#68D391' : step === s.n ? '#63B3ED' : 'rgba(99,179,237,0.1)', color: step >= s.n ? '#070d1a' : '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, border: step < s.n ? '1px solid rgba(99,179,237,0.2)' : 'none', transition: 'all 0.3s' }}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: step === s.n ? 700 : 400, color: step === s.n ? '#EDF2F7' : '#4A5568', whiteSpace: 'nowrap' }}>{s.l}</span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#68D391' : 'rgba(99,179,237,0.1)', margin: '0 0.5rem', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.25)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#FC8181', fontSize: '0.85rem' }}>⚠ {error}</div>}

        {/* ── STEP 1: Plan ── */}
        {step === 1 && (
          <div className="fade-up">
            <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setForm({ ...form, plan: p.id })}
                  style={{ background: form.plan === p.id ? `rgba(${p.id === 'basic' ? '99,179,237' : p.id === 'standard' ? '104,211,145' : '183,148,244'},0.08)` : '#0c1628', border: `1.5px solid ${form.plan === p.id ? p.color + '50' : 'rgba(99,179,237,0.1)'}`, borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', textAlign: 'left', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}20`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {form.plan === p.id ? <span style={{ color: p.color, fontWeight: 800, fontSize: '1rem' }}>✓</span> : <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color + '40', display: 'block' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: form.plan === p.id ? p.color : '#EDF2F7', fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ color: '#718096', fontSize: '0.78rem' }}>{p.courses}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: form.plan === p.id ? p.color : '#EDF2F7', letterSpacing: '-0.02em' }}>${p.price}</div>
                    <div style={{ color: '#4A5568', fontSize: '0.72rem' }}>per semester</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ background: 'rgba(99,179,237,0.04)', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 10, padding: '0.9rem 1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#718096', display: 'flex', gap: '0.5rem' }}>
              <span>🔒</span>
              <span>Your payment will be processed securely after enrollment review. We contact you within 24 hours to confirm details before charging.</span>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}>
              Continue with {selectedPlan.name} — ${selectedPlan.price} →
            </button>
          </div>
        )}

        {/* ── STEP 2: Portal Credentials ── */}
        {step === 2 && (
          <div className="fade-up">
            <div style={{ ...card, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(104,211,145,0.05)', border: '1px solid rgba(104,211,145,0.15)', borderRadius: 10 }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <div style={{ fontSize: '0.8rem', color: '#718096', lineHeight: 1.5 }}>
                  <strong style={{ color: '#68D391' }}>Your credentials are encrypted immediately.</strong> They are only accessible to your assigned manager and automatically deleted after your semester ends.
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={lbl}>University / Institution Name *</label>
                  <input className="inp" style={inp} value={form.university_name} onChange={e => setForm({ ...form, university_name: e.target.value })} placeholder="e.g. University of Michigan" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>Portal URL *</label>
                    <input className="inp" style={inp} value={form.portal_url} onChange={e => setForm({ ...form, portal_url: e.target.value })} placeholder="https://canvas.umich.edu" required />
                  </div>
                  <div>
                    <label style={lbl}>LMS Platform</label>
                    <select className="inp" style={inp} value={form.lms_type} onChange={e => setForm({ ...form, lms_type: e.target.value })}>
                      {LMS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>Portal Username / Student ID *</label>
                    <input className="inp" style={inp} value={form.portal_username} onChange={e => setForm({ ...form, portal_username: e.target.value })} placeholder="jsmith@umich.edu" required />
                  </div>
                  <div>
                    <label style={lbl}>Portal Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input className="inp" style={inp} type={showPassword ? 'text' : 'password'} value={form.portal_password} onChange={e => setForm({ ...form, portal_password: e.target.value })} placeholder="Your portal password" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#718096', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>Your Full Name *</label>
                    <input className="inp" style={inp} value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} placeholder="John Smith" required />
                  </div>
                  <div>
                    <label style={lbl}>Student ID (optional)</label>
                    <input className="inp" style={inp} value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} placeholder="12345678" />
                  </div>
                  <div>
                    <label style={lbl}>Your Timezone</label>
                    <select className="inp" style={inp} value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
                      {TIMEZONES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ justifyContent: 'center' }}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.university_name || !form.portal_url || !form.portal_username || !form.portal_password || !form.student_name) { setError('Please fill in all required fields.'); return }
                setError(''); setStep(3)
              }} style={{ justifyContent: 'center' }}>
                Continue → Semester Details
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Semester ── */}
        {step === 3 && (
          <div className="fade-up">
            <div style={{ ...card, marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={lbl}>Semester / Term *</label>
                    <input className="inp" style={inp} value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} placeholder="Spring 2026" required />
                  </div>
                  <div>
                    <label style={lbl}>Start Date *</label>
                    <input className="inp" style={inp} type="date" value={form.semester_start} onChange={e => setForm({ ...form, semester_start: e.target.value })} required />
                  </div>
                  <div>
                    <label style={lbl}>End Date *</label>
                    <input className="inp" style={inp} type="date" value={form.semester_end} onChange={e => setForm({ ...form, semester_end: e.target.value })} required />
                  </div>
                </div>

                {/* Courses */}
                <div>
                  <label style={{ ...lbl, marginBottom: '0.6rem' }}>Courses to Manage *</label>
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {form.courses.map((c, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <input className="inp" style={{ ...inp, fontSize: '0.82rem' }} value={c.name} onChange={e => updateCourse(i, 'name', e.target.value)} placeholder="Course name" />
                        <input className="inp" style={{ ...inp, fontSize: '0.82rem' }} value={c.code} onChange={e => updateCourse(i, 'code', e.target.value)} placeholder="Code" />
                        <input className="inp" style={{ ...inp, fontSize: '0.82rem' }} value={c.professor} onChange={e => updateCourse(i, 'professor', e.target.value)} placeholder="Professor" />
                        <button onClick={() => removeCourse(i)} disabled={form.courses.length === 1} style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.2)', color: '#FC8181', borderRadius: 8, width: 34, height: 34, cursor: form.courses.length === 1 ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: form.courses.length === 1 ? 0.4 : 1 }}>✕</button>
                      </div>
                    ))}
                    <button onClick={addCourse} style={{ background: 'rgba(99,179,237,0.05)', border: '1px dashed rgba(99,179,237,0.2)', borderRadius: 8, padding: '0.6rem', color: '#63B3ED', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      + Add Another Course
                    </button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Special Instructions (optional)</label>
                  <textarea className="inp" style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Any specific requirements, writing style preferences, GPA goals, professor preferences, etc." />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ justifyContent: 'center' }}>← Back</button>
              <button className="btn btn-primary" onClick={() => {
                if (!form.semester || !form.semester_start || !form.semester_end || !form.courses[0].name) { setError('Please fill in semester details and at least one course.'); return }
                setError(''); setStep(4)
              }} style={{ justifyContent: 'center' }}>
                Review & Confirm →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Confirm ── */}
        {step === 4 && (
          <div className="fade-up">
            <div style={{ ...card, marginBottom: '1rem', border: `1px solid ${selectedPlan.color}30` }}>
              <h3 style={{ fontWeight: 800, color: '#EDF2F7', marginBottom: '1.25rem', fontSize: '1rem' }}>Enrollment Summary</h3>
              <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[
                  ['Plan', `${selectedPlan.name} — $${selectedPlan.price}/semester`],
                  ['University', form.university_name],
                  ['Portal', form.portal_url],
                  ['Platform', form.lms_type],
                  ['Student', form.student_name],
                  ['Semester', `${form.semester} (${form.semester_start} → ${form.semester_end})`],
                  ['Courses', form.courses.filter(c => c.name).map(c => c.name).join(', ')],
                  ['Timezone', form.timezone],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,179,237,0.06)' }}>
                    <span style={{ color: '#718096', fontSize: '0.8rem' }}>{l}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#EDF2F7', maxWidth: '55%', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Password indicator — never show actual password */}
              <div style={{ background: 'rgba(104,211,145,0.05)', border: '1px solid rgba(104,211,145,0.15)', borderRadius: 10, padding: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>🔒</span>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>
                  Portal password: <span style={{ color: '#68D391', fontWeight: 600 }}>Encrypted & secured</span> · Never displayed or shared
                </div>
              </div>

              <div style={{ background: 'rgba(99,179,237,0.04)', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 10, padding: '0.85rem', fontSize: '0.78rem', color: '#718096', lineHeight: 1.6 }}>
                <strong style={{ color: '#63B3ED' }}>What happens next:</strong> Our team reviews your enrollment within 24 hours. You'll receive an email confirmation with payment instructions and your dedicated manager's details.
              </div>
            </div>

            {error && <div style={{ background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.25)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem', color: '#FC8181', fontSize: '0.85rem' }}>⚠ {error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(3)} style={{ justifyContent: 'center' }}>← Edit Details</button>
              <button className="btn btn-green" onClick={handleSubmit} disabled={loading} style={{ justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}>
                {loading ? (
                  <><span style={{ width: 14, height: 14, border: '2px solid rgba(7,13,26,0.3)', borderTopColor: '#070d1a', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Submitting...</>
                ) : <>✅ Submit Enrollment</>}
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1rem', color: '#4A5568', fontSize: '0.75rem' }}>
              By enrolling you agree to our Terms of Service. Payment is collected after enrollment confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
