'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function SimpleSignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setUserId(null)

    try {
      // 1. Brug direkte client-side createClient for lettere fejlfinding
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // 2. Opret bruger i Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        setUserId(data.user.id)
        setSuccess(`Bruger oprettet med ID: ${data.user.id}`)

        // 3. Manuelt opret profil (dette burde omgå trigger problemer)
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                credits: 0
              }
            ])

          if (insertError) {
            setError(`Bruger oprettet, men fejl ved oprettelse af profil: ${insertError.message}`)
          } else {
            setSuccess(`Bruger og profil oprettet succesfuldt!`)
          }
        } catch (profileError: any) {
          setError(`Bruger oprettet, men fejl ved profil: ${profileError.message}`)
        }
      }
    } catch (err: any) {
      console.error('Fejl ved brugeroprettelse:', err)
      // Prøv med vores API-endpoint hvis den normale metode fejlede
      if (err.message?.includes('Database error saving new user')) {
        try {
          const response = await fetch('/api/auth/direct-signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password,
              firstName,
              lastName
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fejl i API-kald');
          }
          
          const result = await response.json();
          setUserId(result.user.id);
          setSuccess(`Bruger oprettet via API med ID: ${result.user.id}`);
        } catch (apiError: any) {
          setError(`API fejl: ${apiError.message}`);
        }
      } else {
        setError(err.message || 'Ukendt fejl ved oprettelse')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{success}</p>
          {userId && (
            <p className="mt-2 text-sm font-mono bg-gray-100 p-1 rounded">
              User ID: {userId}
            </p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Adgangskode</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Fornavn</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Efternavn</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Opretter...' : 'Opret bruger'}
        </button>
      </form>
    </div>
  )
} 