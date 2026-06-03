'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function LoginInner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const params = useSearchParams()

  useEffect(() => {
    const err = params.get('error')
    if (err === 'flow_state_already_used') {
      setError('Session expired. Please try signing in again.')
    } else if (err) {
      setError('Sign in failed. Please try again.')
    }
  }, [params])

  async function handleGoogle() {
    if (loading) return
    setLoading(true)
    setError('')
    const sb = createClient()
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (err) { setError(err.message); setLoading(false) }
    // If no error, browser redirects to Google — keep loading state
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(99,179,237,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#070d1a', fontSize: '1rem' }}>S</div>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EDF2F7' }}>StudyFlow<span style={{ color: '#63B3ED' }}>HQ</span>{' '}<span style={{ fontSize: '0.62rem', background: 'rgba(99,179,237,0.15)', color: '#63B3ED', padding: '0.15rem 0.45rem', borderRadius: 4 }}>PORTAL</span></span>
      </Link>

      <div style={{ width: '100%', maxWidth: 420, background: '#0c1628', border: '1px solid rgba(99,179,237,0.15)', borderRadius: 20, padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EDF2F7', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>Sign in to your portal</h1>
          <p style={{ color: '#718096', fontSize: '0.85rem' }}>Access your enrollment dashboard</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.25)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#FC8181', fontSize: '0.82rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>⚠</span> {error}
          </div>
        )}

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.9rem', background: loading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#EDF2F7', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
        >
          {loading ? (
            <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Redirecting to Google...</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(99,179,237,0.08)' }} />
          <span style={{ color: '#4A5568', fontSize: '0.72rem' }}>One click · No password needed</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(99,179,237,0.08)' }} />
        </div>

        <div style={{ display: 'grid', gap: '0.45rem' }}>
          {['🔒 Secure Google authentication', '📋 Instant access to your dashboard', '🎓 Manage all your enrollments'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.75rem', background: 'rgba(99,179,237,0.03)', borderRadius: 8, fontSize: '0.78rem', color: '#718096' }}>{b}</div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#4A5568', fontSize: '0.75rem' }}>
          New here?{' '}
          <Link href="/onboarding" style={{ color: '#63B3ED', textDecoration: 'none', fontWeight: 600 }}>Start your enrollment →</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#63B3ED', fontFamily: 'Inter, sans-serif' }}>
        Loading...
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}
