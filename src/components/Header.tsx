import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Norsk Marketplace
            </Link>
          </div>
          <nav className="flex space-x-6">
            <Link href="/product" className="text-gray-700 hover:text-primary">
              Produkter
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary">
              Kategorier
            </Link>
            <Link href="/auth/signin" className="text-gray-700 hover:text-primary">
              Log ind
            </Link>
            <Link href="/auth/signup" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90">
              Opret konto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 