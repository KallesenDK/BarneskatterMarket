import Link from 'next/link'
import SignUpForm from './SignUpForm'

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="py-4 px-6 bg-primary">
          <h2 className="text-xl font-bold text-white text-center">Opret en konto</h2>
        </div>
        
        <div className="py-8 px-6">
          <SignUpForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Har du allerede en konto?{' '}
            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
              Log ind
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 