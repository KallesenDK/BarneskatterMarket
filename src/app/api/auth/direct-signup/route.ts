import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()
    
    // Valider input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email og password er påkrævet' },
        { status: 400 }
      )
    }
    
    // Debug information
    console.log('Direkte brugeroprettelse API kaldt for:', email)
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY er ikke defineret')
      return NextResponse.json(
        { error: 'Server konfigurationsfejl' },
        { status: 500 }
      )
    }
    
    // Opret admin klient med service token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Opret bruger med admin API
    console.log('Opretter bruger via admin API')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
      }
    })
    
    if (error) {
      console.error('Admin createUser fejlede:', error)
      return NextResponse.json(
        { error: `Auth fejl: ${error.message}` },
        { status: 400 }
      )
    }
    
    if (!data.user) {
      console.error('Bruger blev ikke oprettet')
      return NextResponse.json(
        { error: 'Bruger kunne ikke oprettes' },
        { status: 400 }
      )
    }
    
    // Indsæt i profiles manuelt
    try {
      console.log('Opretter profil for bruger:', data.user.id)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            first_name: firstName || '',
            last_name: lastName || '',
            credits: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      
      if (profileError) {
        console.error('Fejl ved oprettelse af profil:', profileError)
        // Vi fejler ikke helt her, da brugeren stadig er oprettet
      }
    } catch (profileErr) {
      console.error('Uventet fejl ved profiloprettelse:', profileErr)
    }
    
    return NextResponse.json({
      user: data.user,
      success: true,
      message: 'Bruger oprettet succesfuldt via admin API'
    })
    
  } catch (err: any) {
    console.error('Direkte signup API fejl:', err)
    return NextResponse.json(
      { error: `Server fejl: ${err.message}` },
      { status: 500 }
    )
  }
} 