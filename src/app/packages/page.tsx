'use client';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import { SubscriptionPackageCard } from '@/components/SubscriptionPackageCard'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

interface SubscriptionPackage {
  id: string
  name: string
  description: string
  duration_weeks: number
  product_limit: number
  price: number
  is_active: boolean
}

export default function PackagesPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [packages, setPackages] = useState<SubscriptionPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true })

        if (error) throw error
        setPackages(data || [])
      } catch (error) {
        console.error('Fejl ved hentning af pakker:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [supabase])

  const handleSelectPackage = (pkg: SubscriptionPackage) => {
    router.push(`/checkout?package=${pkg.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-[#1AA49A] overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1AA49A]/90 to-[#158C84]/90" />
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="h-8 w-48 bg-white/20 rounded animate-pulse mx-auto" />
              <div className="h-6 w-64 bg-white/20 rounded animate-pulse mx-auto mt-4" />
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
        </div>
        <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl animate-pulse shadow-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section med bølgeeffekt */}
      <div className="relative bg-[#1AA49A] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1AA49A]/90 to-[#158C84]/90" />
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:16px_16px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Vælg din pakke
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90">
              Find den pakke der passer bedst til dine behov og kom i gang med at sælge dine produkter
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-gray-50" />
      </div>

      {/* Pakker Section */}
      <div className="relative z-10 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <SubscriptionPackageCard
                  pkg={pkg}
                  onSelect={handleSelectPackage}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-gray-600">
              Har du brug for flere produkter? Se vores{' '}
              <a 
                href="/product-slots" 
                className="text-[#1AA49A] hover:text-[#158C84] font-medium hover:underline transition-colors"
              >
                ekstra produktpladser
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 