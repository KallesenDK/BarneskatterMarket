'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import UserNavigation from './components/UserNavigation';
import { useSupabase } from '@/components/SupabaseProvider';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          if (pathname !== '/auth/signin') {
            router.replace('/auth/signin');
          }
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !profile) {
          console.error('Fejl ved hentning af profil:', error);
          if (pathname !== '/auth/signin') {
            router.replace('/auth/signin');
          }
          return;
        }

        // Hvis brugeren er admin og prøver at tilgå user dashboard, send dem til admin dashboard
        if (profile.role === 'admin' && pathname.startsWith('/dashboard/user')) {
          router.replace('/dashboard/admin');
          return;
        }

        // Hvis vi når hertil er alt ok - vis dashboard
        setLoading(false);
      } catch (error) {
        console.error('Fejl i checkUser:', error);
        if (pathname !== '/auth/signin') {
          router.replace('/auth/signin');
        }
      }
    };

    checkUser();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main>{children}</main>
    </div>
  );
} 