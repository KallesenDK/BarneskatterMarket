import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="mb-6 flex justify-center">
          <div className="bg-gray-100 p-5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Produktet blev ikke fundet</h1>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Vi kunne desværre ikke finde det produkt, du leder efter. Det er muligt, at produktet er blevet fjernet eller ikke længere er tilgængeligt.
        </p>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Vores webside har opdateret URL-strukturen for produkter. Hvis du har brugt et gammelt link, kan du finde produktet ved at søge i vores produktkatalog.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/product" 
            className="bg-[#1AA49A] hover:bg-[#158f86] text-white px-5 py-3 rounded-lg font-medium transition-colors"
          >
            Se alle produkter
          </Link>
          <Link 
            href="/" 
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-lg font-medium transition-colors"
          >
            Gå til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
} 