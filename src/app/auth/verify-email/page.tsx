import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">Bekræft din email</h1>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6">
          <p>Vi har sendt en bekræftelsesmail til din email-adresse.</p>
          <p className="mt-2">Klik på linket i emailen for at aktivere din konto.</p>
        </div>
        
        <p className="text-gray-600 mb-8">
          Har du ikke modtaget emailen? Tjek din spam-mappe eller vent et par minutter.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
          >
            Gå til login
          </Link>
          
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-center"
          >
            Tilbage til forsiden
          </Link>
        </div>
      </div>
    </div>
  )
} 