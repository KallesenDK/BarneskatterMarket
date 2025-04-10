import { createClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

// Dette er en hjælpefunktion, der opretter en profil direkte i databasen
// Dette bruges som en fallback, hvis trigger-metoden fejler
export async function createProfileDirectly(
  userId: string, 
  firstName: string, 
  lastName: string
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Dette er et særligt tilfælde, hvor vi faktisk har brug for en ny instans med admin-rettigheder
    // Her bruger vi createClient direkte, da denne instans skal have admin-rettigheder
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Tjek først om profilen allerede findes
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      console.log('Profil findes allerede, opdaterer:', userId)
      // Opdater eksisterende profil
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) throw error
      return data
    } else {
      console.log('Opretter ny profil direkte:', userId)
      // Opret ny profil
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          first_name: firstName,
          last_name: lastName,
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Fejl ved direkte oprettelse af profil:', error)
    throw error
  }
}

// Direkte brugeroprettelse på serveren (bruges af API route)
export async function directUserSignup(email: string, password: string, userData: any) {
  try {
    // Brug den fælles supabase klient
    const supabase = getSupabaseClient();
    
    // 1. Opret brugeren i Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Fejl ved oprettelse af bruger i Supabase Auth:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('Ingen bruger returneret efter oprettelse');
      return { success: false, error: 'Brugeroprettelse fejlede' };
    }

    // 2. Tilføj bruger data til profiles tabel
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: email,
        address: userData.address || null,
        postal_code: userData.postalCode || null,
        phone: userData.phone || null,
        credits: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

    if (profileError) {
      console.error('Fejl ved oprettelse af bruger profil:', profileError);
      return { success: false, error: profileError.message };
    }

    return { 
      success: true, 
      data: { 
        userId: authData.user.id,
        email: authData.user.email
      } 
    };

  } catch (error) {
    console.error('Uventet fejl ved brugeroprettelse:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ukendt fejl' 
    };
  }
} 