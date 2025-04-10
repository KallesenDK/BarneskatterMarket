import { createClient } from '@supabase/supabase-js'

export interface Database {
  public: {
    Tables: {
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          display_order: number;
        };
      };
      // Tilføj andre tabeller her efter behov
    };
  };
}

// Sikr at environment variabler er tilgængelige
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Foretag en validering for at undgå fejl
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL eller anonym nøgle er ikke defineret i miljøvariablerne');
}

// Cookie-navn som bruges konsistent overalt
const AUTH_COOKIE_NAME = 'sb-auth-token';

/**
 * Forbedrede indstillinger for bedre session-håndtering
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
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  persistSession: true,
} as const;

// Definer typen for vores Supabase klient
type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

// Global instans (singleton)
let clientSingleton: TypedSupabaseClient | null = null;

/**
 * Returnerer en Supabase-klient instans
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (clientSingleton) {
    return clientSingleton;
  }
  
  clientSingleton = createClient<Database>(
    supabaseUrl,
    supabaseKey,
    supabaseOptions
  );

  if (typeof window !== 'undefined') {
    clientSingleton.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        document.cookie = `${AUTH_COOKIE_NAME}=${session.access_token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
        if (session.user?.id) {
          localStorage.setItem('userId', session.user.id);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        localStorage.removeItem('userId');
      }
    });
    
    clientSingleton.auth.getSession().then(({ data, error }) => {
      if (data.session) {
        document.cookie = `${AUTH_COOKIE_NAME}=${data.session.access_token}; path=/; max-age=${60*60*24*7}; SameSite=Lax`;
      } else if (error) {
        console.error('Fejl ved tjek af session:', error.message);
      }
    });
  }
  
  return clientSingleton;
}

export default getSupabaseClient(); 