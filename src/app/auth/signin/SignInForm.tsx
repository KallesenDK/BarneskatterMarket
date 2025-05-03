'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'

export default function SignInForm() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      
      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('Ingen session fundet efter login')
      }

      // Hent brugerens profil for at tjekke rolle
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      console.log('DEBUG: Hentet profil:', profile)
      if (profileError) {
        console.error('DEBUG: Fejl ved profilopslag:', profileError)
        throw profileError
      }
      if (!profile || !profile.role) {
        setError('Din brugerprofil blev ikke fundet, eller rolle mangler. Kontakt support hvis problemet fortsætter.')
        setIsLoading(false)
        return
      }
      const redirectPath = profile.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      console.log('DEBUG: Redirect path:', redirectPath)
      router.push(redirectPath)
      
    } catch (err: any) {
      console.error('Login fejl:', err)
      setError(err.message || 'Der skete en fejl under login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Log ind</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Adgangskode
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Glemt adgangskode?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isLoading ? 'Logger ind...' : 'Log ind'}
        </button>
      </form>
    </div>
  )
} 