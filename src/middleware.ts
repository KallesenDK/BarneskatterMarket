import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🚀 Middleware starter på:', request.nextUrl.pathname);
  
  // Hvis vi er på auth sider, lad requesten fortsætte
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    console.log('✅ Auth side - fortsætter');
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Tjek session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  console.log('🔑 Session status:', session ? 'Fundet' : 'Ikke fundet');
  if (sessionError) {
    console.error('❌ Session fejl:', sessionError);
  }

  // Hvis brugeren ikke er logget ind og prøver at tilgå beskyttede routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🔄 Ingen session - omdirigerer til login');
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Hvis brugeren er logget ind og prøver at tilgå auth routes
  if (session && request.nextUrl.pathname.startsWith('/auth')) {
    console.log('🔄 Ingen session - omdirigerer til dashboard');
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  // Hvis brugeren er logget ind og prøver at tilgå /dashboard
  if (session && request.nextUrl.pathname === '/dashboard') {
    console.log('🔄 Ingen session - omdirigerer til dashboard');
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  // Hvis vi er på dashboard stier
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('📊 Dashboard sti detekteret');
    
    try {
      // Hent brugerens profil
      let profile = null;
      if (session && session.user && session.user.id) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        profile = data;
      }

      console.log('👤 Bruger profil:', profile);

      const isAdmin = profile?.role === 'admin';
      const isAdminPath = request.nextUrl.pathname.startsWith('/dashboard/admin');
      const isUserPath = request.nextUrl.pathname.startsWith('/dashboard/user');
      const isDashboardRoot = request.nextUrl.pathname === '/dashboard';

      console.log('🔍 Sti analyse:', {
        isAdmin,
        isAdminPath,
        isUserPath,
        isDashboardRoot,
        currentPath: request.nextUrl.pathname
      });

      // Redirect fra rod dashboard
      if (isDashboardRoot) {
        const redirectUrl = isAdmin ? '/dashboard/admin' : '/dashboard/user';
        console.log('🔄 Omdirigerer fra rod til:', redirectUrl);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // Hvis ikke-admin prøver at tilgå admin sider
      if (!isAdmin && isAdminPath) {
        console.log('⚠️ Ikke-admin prøver at tilgå admin side');
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }

      // Hvis admin prøver at tilgå bruger sider
      if (isAdmin && isUserPath) {
        console.log('⚠️ Admin prøver at tilgå bruger side');
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    } catch (error) {
      console.error('❌ Fejl i middleware:', error);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  console.log('✅ Middleware afslutter - fortsætter request');
  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ]
};
