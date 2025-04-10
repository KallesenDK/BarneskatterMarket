import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">404 - Side ikke fundet</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
          <p>Beklager, men den side du leder efter findes ikke.</p>
        </div>
        
        <p className="text-gray-600 mb-8">
          Siden kan være fjernet, flyttet, eller URLen kan være forkert.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
          >
            Gå til forsiden
          </Link>
          
          <Link
            href="/product"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-center"
          >
            Se produkter
          </Link>
          
          <Link
            href="/auth/signin"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 text-center"
          >
            Log ind
          </Link>
        </div>
      </div>
    </div>
  )
} 