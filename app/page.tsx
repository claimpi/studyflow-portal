import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const plans = [
  { name: 'Basic', price: 300, semester: true, courses: '1–2 courses', features: ['Assignment submission', 'Deadline tracking', 'Weekly email report', 'Email support'], color: '#63B3ED', popular: false },
  { name: 'Standard', price: 500, semester: true, courses: '3–4 courses', features: ['Everything in Basic', 'Discussion board posts', 'Quiz completion', 'Priority support', 'Daily status updates'], color: '#68D391', popular: true },
  { name: 'Premium', price: 800, semester: true, courses: '5+ courses', features: ['Everything in Standard', 'Exam assistance', 'Grade monitoring & alerts', 'WhatsApp updates', 'Dedicated manager'], color: '#B794F4', popular: false },
]

const steps = [
  { n: '01', icon: '🔐', title: 'Share Your Portal', desc: 'Securely submit your university portal login, course list and semester dates. Credentials are encrypted and never shared.' },
  { n: '02', icon: '👤', title: 'Get Assigned a Manager', desc: 'A dedicated academic manager logs into your portal daily to monitor deadlines and assignments.' },
  { n: '03', icon: '✅', title: 'We Handle Everything', desc: 'Assignments submitted, discussions posted, quizzes completed — all on time, every time.' },
  { n: '04', icon: '📊', title: 'Weekly Reports to You', desc: 'Every week you get a full report: what was done, what is coming up, your current grades.' },
]

const faqs = [
  { q: 'Is my login information safe?', a: 'Your credentials are encrypted immediately on submission and only accessed by your assigned manager. We never share, sell or store passwords in plain text. You can change your password after the semester.' },
  { q: 'Will my university know?', a: 'No. Your manager logs in from a consistent IP and behaves exactly as a student would. There are no system flags or alerts triggered.' },
  { q: 'What if I fail or get a bad grade?', a: 'We have a quality guarantee. If work is submitted incorrectly or a deadline is missed due to our error, you receive a partial refund. We maintain a 97% on-time submission rate.' },
  { q: 'What universities do you support?', a: 'We support all major LMS platforms including Canvas, Blackboard, Moodle, D2L Brightspace, and university-specific portals across US and UK institutions.' },
  { q: 'Can I start mid-semester?', a: 'Yes. We prorate pricing for enrollments after semester start. Contact us with your start date for a custom quote.' },
]

export default function Home() {
  return (
    <div style={{ background: '#070d1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ padding: '5rem 1.5rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,179,237,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,179,237,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(104,211,145,0.08)', border: '1px solid rgba(104,211,145,0.2)', borderRadius: 100, padding: '0.35rem 1rem', marginBottom: '2rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#68D391', display: 'inline-block' }} className="pulse" />
            <span style={{ color: '#68D391', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Now accepting Spring 2026 enrollments</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', color: '#EDF2F7', marginBottom: '0.5rem' }}>
            We Manage Your
          </h1>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '1.75rem' }} className="gtext">
            University Portal.
          </h1>

          <p style={{ color: '#718096', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 1rem', lineHeight: 1.7 }}>
            Struggling to keep up with assignments, deadlines and submissions? Give us your portal login and we handle everything — so you can focus on what actually matters.
          </p>
          <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            Canvas · Blackboard · Moodle · D2L Brightspace · All major US & UK universities
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/onboarding" className="btn btn-green" style={{ fontSize: '1rem', padding: '0.9rem 2.25rem' }}>
              Start Enrollment — From $300 →
            </Link>
            <Link href="#how-it-works" className="btn btn-outline" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
              See How It Works
            </Link>
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🔒 Encrypted credentials', '⏰ 97% on-time rate', '🎓 All major LMS platforms', '↩️ Satisfaction guarantee'].map(t => (
              <span key={t} style={{ color: '#4A5568', fontSize: '0.82rem', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE HANDLE ── */}
      <section style={{ padding: '4rem 1.5rem', borderTop: '1px solid rgba(99,179,237,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#63B3ED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Full Portal Coverage</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.03em' }}>Everything in Your Portal. Handled.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { icon: '📝', title: 'Assignments', desc: 'Every assignment submitted on time with quality work matching your course level.' },
              { icon: '💬', title: 'Discussion Boards', desc: 'Thoughtful, on-topic responses posted for all discussion requirements.' },
              { icon: '📋', title: 'Quizzes & Tests', desc: 'Online quizzes and timed tests completed accurately within your portal.' },
              { icon: '📅', title: 'Deadline Tracking', desc: 'We monitor every due date and ensure nothing is ever missed or late.' },
              { icon: '📊', title: 'Grade Monitoring', desc: 'Track your GPA in real time. Get alerts if a grade drops unexpectedly.' },
              { icon: '📩', title: 'Professor Emails', desc: 'We read and respond to routine professor messages on your behalf.' },
              { icon: '📁', title: 'File Submissions', desc: 'Upload assignments, projects and documents in the correct portal format.' },
              { icon: '📈', title: 'Progress Reports', desc: 'Weekly reports emailed to you with a full summary of the week.' },
            ].map(s => (
              <div key={s.title} style={{ background: '#0a1522', padding: '1.75rem', transition: 'background 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0c1628')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0a1522')}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: '#EDF2F7', marginBottom: '0.35rem', fontSize: '0.9rem' }}>{s.title}</div>
                <div style={{ color: '#718096', fontSize: '0.8rem', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: '#060c18', borderTop: '1px solid rgba(99,179,237,0.08)', borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#63B3ED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Simple Process</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.03em' }}>Up and Running in 24 Hours</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0' }}>
            {steps.map((s, i) => (
              <div key={s.n} style={{ padding: '2rem 1.5rem', borderLeft: i > 0 ? '1px solid rgba(99,179,237,0.08)' : 'none' }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(99,179,237,0.07)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>{s.n}</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, color: '#63B3ED', marginBottom: '0.4rem', fontSize: '0.92rem' }}>{s.title}</div>
                <div style={{ color: '#718096', fontSize: '0.82rem', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#63B3ED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Semester Pricing</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>One Payment. Full Semester.</h2>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>No per-assignment fees. No surprises. Pay once and we handle everything until finals.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {plans.map(p => (
              <div key={p.name} style={{ background: '#0c1628', border: `1px solid ${p.popular ? p.color + '40' : 'rgba(99,179,237,0.1)'}`, borderRadius: 20, padding: '2rem', position: 'relative', boxShadow: p.popular ? `0 0 40px ${p.color}10` : 'none' }}>
                {p.popular && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: p.color, color: '#070d1a', padding: '0.2rem 1rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, color: p.color, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.04em' }}>${p.price}</span>
                    <span style={{ color: '#718096', fontSize: '0.88rem' }}>/semester</span>
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.82rem' }}>{p.courses}</div>
                </div>
                <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#A0AEC0' }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link href="/onboarding" className="btn" style={{ width: '100%', justifyContent: 'center', background: p.popular ? `linear-gradient(135deg, ${p.color}, ${p.color}cc)` : 'transparent', color: p.popular ? '#070d1a' : p.color, border: p.popular ? 'none' : `1.5px solid ${p.color}50`, fontSize: '0.9rem', padding: '0.85rem' }}>
                  Enroll Now →
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#4A5568', fontSize: '0.82rem' }}>
            💳 Secure payment via Stripe · Visa · Mastercard · PayPal · All prices in USD
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '5rem 1.5rem', background: '#060c18', borderTop: '1px solid rgba(99,179,237,0.08)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.03em' }}>Common Questions</h2>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: '#0c1628', border: '1px solid rgba(99,179,237,0.1)', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                <div style={{ fontWeight: 700, color: '#EDF2F7', marginBottom: '0.5rem', fontSize: '0.92rem' }}>{faq.q}</div>
                <div style={{ color: '#718096', fontSize: '0.85rem', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', color: '#63B3ED', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>Get Started Today</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '1rem' }}>
            Stop stressing.<br />Let us handle it.
          </h2>
          <p style={{ color: '#718096', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Join students across the US and UK who have handed their portal to StudyFlowHQ and reclaimed their time.
          </p>
          <Link href="/onboarding" className="btn btn-green" style={{ fontSize: '1.05rem', padding: '1rem 2.75rem' }}>
            Enroll This Semester →
          </Link>
          <p style={{ marginTop: '1.25rem', color: '#4A5568', fontSize: '0.8rem' }}>
            Enrollment takes 10 minutes · We start within 24 hours · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#050b15', borderTop: '1px solid rgba(99,179,237,0.08)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem', color: '#070d1a' }}>S</div>
          <span style={{ fontWeight: 800, color: '#EDF2F7', fontSize: '0.95rem' }}>StudyFlow<span style={{ color: '#63B3ED' }}>HQ</span> Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[['Privacy Policy','#'],['Terms of Service','#'],['Contact','mailto:info@studyflowhq.com'],['Main Site','https://studyflowhq.vercel.app']].map(([l,h]) => (
            <a key={l} href={h} style={{ color: '#4A5568', textDecoration: 'none', fontSize: '0.8rem' }}>{l}</a>
          ))}
        </div>
        <p style={{ color: '#2D3748', fontSize: '0.75rem' }}>© {new Date().getFullYear()} StudyFlowHQ. All rights reserved.</p>
      </footer>
    </div>
  )
}
