import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Opret response objekt
    const res = NextResponse.next();
    
    // Opret Supabase klient med request og response
    const supabase = createMiddlewareClient({ req: request, res });

    // Tjek om brugeren er logget ind
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session fejl i middleware:', sessionError);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Hvis brugeren ikke er logget ind og prøver at tilgå beskyttede ruter
    if (!session && !request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Hvis brugeren er logget ind og prøver at tilgå login/signup sider
    if (session && request.nextUrl.pathname.startsWith('/auth/')) {
      // Tjek om brugeren er admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profil fejl i middleware:', profileError);
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      if (profile?.role === 'admin') {
        // Hvis admin, redirect til admin dashboard
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      } else {
        // Hvis ikke admin, redirect til almindeligt dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Hvis ruten starter med /dashboard/admin
    if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      if (!session) {
        // Hvis ikke logget ind, redirect til login
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Tjek om brugeren er admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profil fejl i middleware:', profileError);
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      if (profile?.role !== 'admin') {
        // Hvis ikke admin, redirect til dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Opdater response med session cookie
    return res;
  } catch (error) {
    console.error('Uventet fejl i middleware:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ],
};
