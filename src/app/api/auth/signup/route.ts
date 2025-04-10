import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json()
    
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Manglende påkrævede felter' },
        { status: 400 }
      )
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Opret admin klient til at håndtere brugersignup
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Opret bruger
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })
    
    if (error) {
      console.error('API fejl ved oprettelse af bruger:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Sørg for at profilen bliver oprettet
    if (data.user) {
      try {
        // Tjek om profilen allerede findes
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        if (!existingProfile) {
          // Opret profil manuelt
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              credits: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
          
          if (profileError) {
            console.error('API fejl ved oprettelse af profil:', profileError)
          }
        }
      } catch (profileErr) {
        console.error('Generel fejl ved profilhåndtering:', profileErr)
      }
    }
    
    return NextResponse.json({ 
      user: data.user, 
      message: 'Bruger oprettet succesfuldt' 
    })
    
  } catch (err) {
    console.error('Uventet fejl i signup API:', err)
    return NextResponse.json(
      { error: 'Der opstod en uventet fejl ved brugeroprettelsen' },
      { status: 500 }
    )
  }
} 