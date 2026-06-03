'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function Inner() {
  const router = useRouter()
  const [status, setStatus] = useState('Completing sign in...')
  useEffect(() => {
    async function run() {
      const sb = createClient()
      const hash = window.location.hash
      if (hash?.includes('access_token')) {
        const p = new URLSearchParams(hash.substring(1))
        const at = p.get('access_token'), rt = p.get('refresh_token')
        if (at && rt) { try { await sb.auth.setSession({ access_token: at, refresh_token: rt }) } catch { setStatus('Auth failed. Redirecting...'); setTimeout(() => router.push('/auth/login'), 2000); return } }
      }
      await new Promise(r => setTimeout(r, 800))
      const { data: { session } } = await sb.auth.getSession()
      if (session) {
        setStatus('Success! Loading your dashboard...')
        await sb.from('profiles').upsert({ id: session.user.id, email: session.user.email!, full_name: session.user.user_metadata?.full_name, avatar_url: session.user.user_metadata?.avatar_url })
        router.push('/dashboard')
      } else { setStatus('Session not found. Redirecting...'); setTimeout(() => router.push('/auth/login'), 2000) }
    }
    run()
  }, [router])
  return (
    <div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#63B3ED,#68D391)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#070d1a' }}>S</div>
      <div style={{ width: 38, height: 38, border: '3px solid rgba(99,179,237,0.15)', borderTopColor: '#63B3ED', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ConfirmPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#070d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#63B3ED', fontFamily: 'Inter, sans-serif' }}>Loading...</div>}><Inner /></Suspense>
}
