'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/components/SupabaseProvider'
import { Session } from '@supabase/supabase-js'
import ProductsOverview from './components/ProductsOverview'
import EarningsOverview from './components/EarningsOverview'
import PayoutsOverview from './components/PayoutsOverview'
import DashboardHeader from './components/DashboardHeader'

// Konstant for cookie navn
const DASHBOARD_ACCESS_COOKIE = 'dashboard-access-token'

// Hjælpefunktion til at sætte cookies
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

// Loading komponent
function LoadingDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse bg-gray-100 h-12 w-60 mb-8 rounded"></div>
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        <div className="p-4 border rounded-lg animate-pulse bg-gray-100 h-48"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border rounded-lg animate-pulse bg-gray-100 h-48"></div>
          <div className="p-4 border rounded-lg animate-pulse bg-gray-100 h-48"></div>
        </div>
      </div>
    </div>
  )
}

// Auth Error komponent
function AuthError() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Adgang nægtet</h1>
        <p className="text-gray-600 mb-6">
          Din session kunne ikke valideres. Du skal logge ind for at få adgang til dashboard.
        </p>
        <Link 
          href="/auth/signin"
          className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
        >
          Gå til login
        </Link>
      </div>
    </div>
  )
}

export default function DashboardClient({ initialSession }: { initialSession: Session | null }) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [productLimits, setProductLimits] = useState({
    productLimit: 0,
    usedProducts: 0,
    availableProducts: 0
  })
  
  // Effekt til at hente og validere session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        
        // Hent bruger session
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          throw userError
        }
        
        if (!user) {
          router.push('/auth/signin')
          return
        }
        
        setUserId(user.id)
        
        // Hent produktgrænser
        const { data: limits, error: limitsError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            subscription_packages (
              product_limit
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .single()
          
        if (!limitsError && limits) {
          setProductLimits({
            productLimit: limits.subscription_packages?.product_limit || 0,
            usedProducts: 0, // Dette vil blive opdateret når vi henter produkter
            availableProducts: limits.subscription_packages?.product_limit || 0
          })
        }
        
      } catch (error) {
        console.error('Fejl ved sessionstjek:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
  }, [initialSession, supabase, router])
  
  if (loading) {
    return <LoadingDashboard />
  }
  
  // Hvis vi ikke har et bruger-ID, vis fejl
  if (!userId) {
    return <AuthError />
  }
  
  // Nu kan vi vise dashboardet med bruger-ID
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        <ProductsOverview userId={userId} productLimits={productLimits} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <EarningsOverview userId={userId} />
          <PayoutsOverview userId={userId} />
        </div>
      </div>
    </div>
  )
} 