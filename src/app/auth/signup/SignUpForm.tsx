'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import { createProfileDirectly } from './direct-create'

export default function SignUpForm() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validering
    if (formData.password !== formData.confirmPassword) {
      setError('De indtastede adgangskoder er ikke ens')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Adgangskoden skal være mindst 6 tegn')
      return
    }
    
    if (!formData.agreeTerms) {
      setError('Du skal acceptere vilkår og betingelser')
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('Starter brugeroprettelse med følgende data:', { 
        email: formData.email, 
        firstName: formData.firstName, 
        lastName: formData.lastName 
      })
      
      let isSuccess = false
      
      try {
        // Forsøg først med normal Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (signUpError) {
          console.error('Supabase auth.signUp fejl:', signUpError)
        
          if (signUpError.message?.includes('saving new user')) {
            console.log('Database fejl ved brugeroprettelse, prøver alternativ metode')
            throw signUpError // Går til fallback metoden
          } else {
            throw signUpError // Anden fejl, kast den videre
          }
        }
        
        console.log('Bruger oprettet i auth:', data)
        isSuccess = true
        
      } catch (signUpErr: any) {
        console.log('Falder tilbage til API metoden efter fejl:', signUpErr.message)
        
        if (signUpErr.message?.includes('saving new user')) {
          // Prøv med vores API-endpoint som fallback
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              firstName: formData.firstName,
              lastName: formData.lastName
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Fejl i API-kald')
          }
          
          const result = await response.json()
          console.log('Bruger oprettet via API:', result)
          isSuccess = true
        } else {
          // Kast fejlen videre
          throw signUpErr
        }
      }
      
      // Hvis en af metoderne lykkedes
      if (isSuccess) {
        // Omdirigér til bekræftelses-siden
        router.push('/auth/verify-email')
      }
      
    } catch (err: any) {
      console.error('Fejl ved oprettelse af bruger:', err)
      
      // Mere informativ fejlmeddelelse baseret på fejlkoden
      if (err.message?.includes('duplicate key') || err.message?.includes('already been registered')) {
        setError('Der findes allerede en bruger med denne email')
      } else if (err.message?.includes('invalid email')) {
        setError('Den angivne email er ikke gyldig')
      } else if (err.message?.includes('password')) {
        setError('Adgangskoden er for svag. Brug mindst 6 tegn med både bogstaver og tal')
      } else if (err.message?.includes('saving new user')) {
        setError('Der opstod en fejl ved oprettelse af brugerprofilen. Prøv igen.')
      } else {
        setError(err.message || 'Der opstod en fejl ved oprettelse af kontoen')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Fornavn
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Efternavn
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
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
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Adgangskode
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Bekræft adgangskode
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="agreeTerms"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
          Jeg accepterer <a href="/terms" className="text-primary hover:underline">vilkår og betingelser</a>
        </label>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
      >
        {isLoading ? 'Opretter konto...' : 'Opret konto'}
      </button>
    </form>
  )
} 