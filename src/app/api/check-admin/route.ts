import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Få den aktuelle brugers session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
    }

    // Brug service role klient til at tjekke admin rettigheder
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (roleError) {
      console.error('Fejl ved tjek af admin rolle:', roleError);
      return NextResponse.json({ error: 'Serverfejl' }, { status: 500 });
    }

    return NextResponse.json({ isAdmin: !!roles });
  } catch (error) {
    console.error('Uventet fejl:', error);
    return NextResponse.json({ error: 'Serverfejl' }, { status: 500 });
  }
} 