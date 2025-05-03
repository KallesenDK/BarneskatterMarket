import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  try {
    // Hent den nuværende bruger fra auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth fejl:', authError);
      return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
    }

    // Tjek om den nuværende bruger er admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !currentUserProfile?.is_admin) {
      console.error('Admin tjek fejl:', profileError);
      return NextResponse.json({ error: 'Ikke autoriseret som admin' }, { status: 403 });
    }

    // Hent request data
    const { userId, role, isAdmin } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'Manglende bruger ID eller rolle' }, { status: 400 });
    }

    console.log('Opdaterer bruger:', { userId, role, isAdmin });

    // Opdater brugerens profil med supabaseAdmin
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: role,
        is_admin: role === 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Opdateringsfejl:', updateError);
      return NextResponse.json({ error: 'Kunne ikke opdatere brugerprofil' }, { status: 500 });
    }

    console.log('Bruger opdateret:', updatedProfile);
    return NextResponse.json({ success: true, data: updatedProfile });

  } catch (error) {
    console.error('Uventet fejl:', error);
    return NextResponse.json({ error: 'Der opstod en uventet fejl' }, { status: 500 });
  }
} 