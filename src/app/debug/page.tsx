import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default async function DebugPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Hent session
  const { data: { session } } = await supabase.auth.getSession()
  
  // Konverter cookies til læsbart format
  const allCookies = cookieStore.getAll()
  const cookieList = allCookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value.substring(0, 20) + (cookie.value.length > 20 ? '...' : '')
  }))
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Debug Information</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          
          {session ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Bruger er logget ind</p>
              <p className="mt-2">User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              <p className="font-medium">Bruger er IKKE logget ind</p>
              <p className="mt-2">Ingen aktiv session fundet</p>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <Link href="/auth/signin" className="inline-block text-blue-600 hover:underline mr-4">
              Gå til Login
            </Link>
            <Link href="/dashboard" className="inline-block text-blue-600 hover:underline">
              Gå til Dashboard
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Cookies ({cookieList.length})</h2>
          
          {cookieList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Navn
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Værdi (forkortet)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cookieList.map((cookie, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cookie.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cookie.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Ingen cookies fundet</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Hvad nu?</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Hvis du ser "Bruger er logget ind" ovenfor, men stadig ikke kan tilgå dashboard, så kan der være problemer med:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Cookie-indstillinger - tjek om Supabase session cookies er til stede</li>
              <li>Routing - tjek at omdirigeringer fungerer korrekt</li>
              <li>Caching - prøv at rydde browser-cache</li>
              <li>CORS-indstillinger på Supabase-projektet</li>
            </ul>
            
            <div className="mt-6">
              <button
                onClick={() => {
                  window.location.href = '/dashboard'
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Tving omdirigering til dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 