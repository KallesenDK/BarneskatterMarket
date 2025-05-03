'use client';

import { useSupabase } from '@/components/SupabaseProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/components/Cart/CartProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Fejl ved bruger check:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  return (
    <html lang="da">
      <body>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
} 