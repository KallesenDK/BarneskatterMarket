import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('Middleware køres på sti:', req.nextUrl.pathname)
  
  // Vi opretter et nyt response-objekt
  const res = NextResponse.next()
  
  // Opret Supabase-klienten til middleware
  const supabase = createMiddlewareClient({ req, res })
  
  // Hent session
  const { data } = await supabase.auth.getSession()
  
  console.log('Session i middleware:', data.session ? `Aktiv (${data.session.user.id})` : 'Ingen')
  
  // Få adgangs-sti
  const path = req.nextUrl.pathname
  
  // Hvis stien starter med /dashboard og der ikke er nogen session
  if (path.startsWith('/dashboard') && !data.session) {
    console.log('Omdirigerer til login fra middleware')
    // Omdirigér til login-siden med en query parameter
    const redirectUrl = new URL('/auth/signin', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

// Kør middleware på både auth og dashboard stier for at sikre sessions
export const config = {
  matcher: ['/dashboard/:path*', '/dashboard']
} 