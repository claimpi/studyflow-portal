'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = sb.auth.onAuthStateChange((_, s) => setUser(s?.user || null))
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
    setMenuOpen(false)
  }

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'
  const avatar = user?.user_metadata?.avatar_url
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <nav style={{ background: scrolled ? 'rgba(7,13,26,0.97)' : 'rgba(7,13,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: scrolled ? '1px solid rgba(99,179,237,0.1)' : '1px solid transparent', position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#070d1a' }}>S</div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EDF2F7', letterSpacing: '-0.02em' }}>
            StudyFlow<span style={{ color: '#63B3ED' }}>HQ</span>{' '}
            <span style={{ fontSize: '0.62rem', background: 'rgba(99,179,237,0.15)', color: '#63B3ED', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 700, verticalAlign: 'middle' }}>PORTAL</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {!user && <>
            <Link href="/#how-it-works" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>How It Works</Link>
            <Link href="/#pricing" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Pricing</Link>
          </>}
          {user && <Link href="/dashboard" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Dashboard</Link>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 100, padding: '0.3rem 0.85rem 0.3rem 0.3rem', cursor: 'pointer' }}>
                {avatar ? <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} /> : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#070d1a' }}>{initials}</div>}
                <span style={{ color: '#EDF2F7', fontSize: '0.82rem', fontWeight: 600 }}>{name.split(' ')[0]}</span>
                <span style={{ color: '#718096', fontSize: '0.65rem' }}>{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setMenuOpen(false)} />
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0c1628', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 12, minWidth: 180, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 99, overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(99,179,237,0.08)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#EDF2F7' }}>{name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#718096' }}>{user.email}</div>
                    </div>
                    {[{ href: '/dashboard', label: '📋 My Dashboard' }, { href: '/onboarding', label: '➕ New Enrollment' }].map(i => (
                      <Link key={i.href} href={i.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.6rem 1rem', color: '#A0AEC0', textDecoration: 'none', fontSize: '0.85rem' }}>{i.label}</Link>
                    ))}
                    <div style={{ borderTop: '1px solid rgba(99,179,237,0.08)' }}>
                      <button onClick={signOut} style={{ width: '100%', padding: '0.6rem 1rem', color: '#FC8181', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>🚪 Sign Out</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: '#718096', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Sign In</Link>
              <Link href="/onboarding" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: 8 }}>Get Started →</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
