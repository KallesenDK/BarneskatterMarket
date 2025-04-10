import { createClient } from '@supabase/supabase-js'

// Sikr at environment variabler er tilgængelige
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Foretag en validering for at undgå fejl
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL eller anonym nøgle er ikke defineret i miljøvariablerne');
}

// Cookie-navn som bruges konsistent overalt
const AUTH_COOKIE_NAME = 'sb-auth-token';

/**
 * Forbedrede indstillinger for bedre session-håndtering
 * Disse indstillinger fokuserer på at sikre session bevares både i cookies og localStorage
 */
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'supabase.auth.token',
    detectSessionInUrl: true,
    flowType: 'implicit',
    debug: false,
  },
  cookies: {
    name: AUTH_COOKIE_NAME,
    lifetime: 60 * 60 * 24 * 7, // 7 dage
    domain: '',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  global: {
    headers: { 'x-client-info': 'supabase-js/2.x' }
  },
  // Disse indstillinger er vigtige for at Next.js Edge funktioner kan fungere
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  // Sikkerhedsindstillinger
  persistSession: true,
}

// Global instans (singleton) som deles mellem server og klient
let clientSingleton: ReturnType<typeof createClient> | null = null;

/**
 * Returnerer en Supabase-klient instans med optimerede indstillinger
 * for session-håndtering og Next.js kompatibilitet
 */
export function getSupabaseClient() {
  if (clientSingleton) {
    return clientSingleton;
  }
  
  // Opret en ny instans
  clientSingleton = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

  // Hvis vi er i browser-miljø, gem sessioninfo i localStorage som backup
  if (typeof window !== 'undefined') {
    // Ekstra sikkerhedsforanstaltning: Gem auth cookie på window.document
    // Dette hjælper til at middleware kan finde cookien
    clientSingleton.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Gem cookie lokalt som et ekstra sikkerhedsnet
        document.cookie = `${AUTH_COOKIE_NAME}=${session.access_token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
        
        // Gem også bruger-ID i localStorage for let adgang
        if (session.user?.id) {
          localStorage.setItem('userId', session.user.id);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        // Ryd cookie ved logout
        document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        localStorage.removeItem('userId');
      }
    });
    
    // Tjek om der er en aktiv session ved start
    clientSingleton.auth.getSession().then(({ data, error }) => {
      if (data.session) {
        // Gem cookie lokalt igen, for at sikre den er frisk
        document.cookie = `${AUTH_COOKIE_NAME}=${data.session.access_token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
      } else if (error) {
        console.error('Fejl ved tjek af session:', error.message);
      }
    });
  }
  
  return clientSingleton;
}

// VIGTIGT: Eksporter ikke en direkte instans mere - brug altid getSupabaseClient funktionen
// export const supabase = getSupabaseClient() // Fjernet for at undgå unødvendige, ukoordinerede instanser 