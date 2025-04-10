import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Fallback komponent ved fejl
function AuthError() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Adgang nægtet</h1>
        <p className="text-gray-600 mb-6">
          Din session kunne ikke valideres. Du skal logge ind for at få adgang til dashboard.
        </p>
        <Link 
          href="/auth/signin"
          className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
        >
          Gå til login
        </Link>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    // Tjek om vi kommer fra login-siden med auth-parameter
    const authParam = searchParams.auth;
    
    // Opret Supabase klient med cookies fra anmodningen
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });
    
    // Tjek om brugeren er logget ind
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Dashboard søgeparametre:', searchParams);
    console.log('Session status på server:', data.session ? 'Aktiv' : 'Ingen');
    
    if (!data.session) {
      return <AuthError />;
    }

    // Tjek om brugeren er admin
    const isAdmin = data.session.user.email === 'kenneth@sigmatic.dk';
    
    // Omdiriger baseret på brugerens rolle
    if (isAdmin) {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard/user');
    }
    
  } catch (error) {
    console.error('Uventet fejl i dashboard-siden:', error);
    return <AuthError />;
  }
} 