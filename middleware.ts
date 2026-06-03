import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let res = NextResponse.next({ request })
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll: (c) => { c.forEach(({ name, value }) => request.cookies.set(name, value)); res = NextResponse.next({ request }); c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)) } } })
  const { data: { user } } = await sb.auth.getUser()
  const { pathname } = request.nextUrl
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return res
}
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/onboarding/:path*'] }
