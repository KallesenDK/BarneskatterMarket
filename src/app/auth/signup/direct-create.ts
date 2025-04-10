import { createClient } from '@supabase/supabase-js'
import supabase from '@/lib/supabase'

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
export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  address: string,
  postalCode: string,
  phone: string
) {
  try {
    if (!supabase) {
      throw new Error('Supabase klient er ikke initialiseret');
    }

    // 1. Opret brugeren i Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Ingen bruger returneret fra auth');

    // 2. Opret brugerens profil i profiles tabellen
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        address,
        postal_code: postalCode,
        phone,
        email,
      });

    if (profileError) throw profileError;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Fejl ved oprettelse af bruger:', error);
    return { success: false, error };
  }
} 