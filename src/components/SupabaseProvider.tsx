'use client'

import { createContext, useContext, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClient } from '@supabase/supabase-js'

// Opret SupabaseContext type
type SupabaseContext = {
  supabase: SupabaseClient
}

// Opret en context til at holde Supabase klienten
const Context = createContext<SupabaseContext | undefined>(undefined)

// SupabaseProvider komponent
export default function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [supabaseClient] = useState(() => createClientComponentClient())
  
  return (
    <Context.Provider value={{ supabase: supabaseClient }}>
      {children}
    </Context.Provider>
  )
}

// Hook til at bruge Supabase klienten i komponenter
export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
} 