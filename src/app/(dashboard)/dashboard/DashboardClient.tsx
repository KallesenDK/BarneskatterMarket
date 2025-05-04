'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import ProfileUpdateModal from '@/components/ProfileUpdateModal'
import AdminNavigation from "./admin/components/AdminNavigation"
import UserNavigation from "./user/components/UserNavigation"

interface DashboardClientProps {
  children: React.ReactNode
  isAdmin: boolean
}

export default function DashboardClient({ children, isAdmin }: DashboardClientProps) {
  const { supabase } = useSupabase()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function checkProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profile)

      if (profile && (!profile.address || !profile.postal_code || !profile.phone)) {
        setShowProfileModal(true)
      }
    }

    checkProfile()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isAdmin ? <AdminNavigation /> : <UserNavigation />}
        <main>{children}</main>
      </div>

      <ProfileUpdateModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
      />
    </div>
  )
} 