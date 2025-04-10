import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware kører for path:', request.nextUrl.pathname);
    
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Hent session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Session status:', session ? 'Logget ind' : 'Ikke logget ind');
    if (session) {
      console.log('Bruger email:', session.user.email);
    }

    // Håndter root dashboard sti
    if (request.nextUrl.pathname === '/dashboard') {
      if (!session) {
        console.log('Ingen session, omdirigerer til login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Omdiriger til korrekt dashboard baseret på rolle
      const isAdmin = session.user.email === 'kenneth@sigmatic.dk';
      console.log('Omdirigerer til:', isAdmin ? '/dashboard/admin' : '/dashboard/user');
      return NextResponse.redirect(new URL(isAdmin ? '/dashboard/admin' : '/dashboard/user', request.url));
    }

    // Tjek om brugeren prøver at tilgå admin routes
    if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      if (!session) {
        console.log('Ingen session, omdirigerer til login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Tjek om brugeren er admin baseret på email
      const isAdmin = session.user.email === 'kenneth@sigmatic.dk';
      if (!isAdmin) {
        console.log('Ikke admin, omdirigerer til bruger dashboard');
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }
    }

    // Tjek om brugeren prøver at tilgå bruger routes
    if (request.nextUrl.pathname.startsWith('/dashboard/user')) {
      if (!session) {
        console.log('Ingen session, omdirigerer til login');
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }
      
      // Tjek om brugeren er admin
      const isAdmin = session.user.email === 'kenneth@sigmatic.dk';
      if (isAdmin) {
        console.log('Admin, omdirigerer til admin dashboard');
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    }

    // Tjek om brugeren prøver at tilgå auth routes mens de er logget ind
    if (request.nextUrl.pathname.startsWith('/auth/')) {
      if (session) {
        // Hvis logget ind, redirect baseret på rolle
        const isAdmin = session.user.email === 'kenneth@sigmatic.dk';
        console.log('Allerede logget ind, omdirigerer til:', isAdmin ? '/dashboard/admin' : '/dashboard/user');
        return NextResponse.redirect(new URL(isAdmin ? '/dashboard/admin' : '/dashboard/user', request.url));
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware fejl:', error);
    return NextResponse.next();
  }
}

// Konfigurer middleware til at køre på relevante routes
export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/auth/:path*']
};
