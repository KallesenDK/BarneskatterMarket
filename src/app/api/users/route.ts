import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, address, postal_code, phone, role } = body;

    const supabase = createRouteHandlerClient({ cookies });

    // Opret auth bruger
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      // Opret profil med både role og is_admin
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name,
          last_name,
          address: address || null,
          postal_code: postal_code || null,
          phone: phone || null,
          role: role || 'user',
          is_admin: role === 'admin', // Sæt is_admin baseret på role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          credits: 0,
          avatar_url: null,
          subscription_end_date: null
        });

      if (profileError) {
        // Hvis profil oprettelsen fejler, slet auth brugeren
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.error('Profil oprettelses fejl:', profileError);
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        user: {
          ...authData.user,
          role,
          is_admin: role === 'admin'
        } 
      });
    }
  } catch (error) {
    console.error('Fejl ved oprettelse af bruger:', error);
    return NextResponse.json({ error: 'Der skete en fejl ved oprettelse af brugeren' }, { status: 500 });
  }
} 