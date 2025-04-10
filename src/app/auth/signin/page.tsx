import Link from 'next/link'
import SignInForm from './SignInForm'

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-4 px-6 bg-primary">
          <h2 className="text-xl font-bold text-white text-center">Log ind</h2>
        </div>
        
        <div className="py-8 px-6">
          <SignInForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Har du ikke en konto?{' '}
            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
              Opret konto
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 