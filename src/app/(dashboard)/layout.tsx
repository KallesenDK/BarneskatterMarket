"use client";
export const dynamic = "force-dynamic";
import SupabaseProvider from '@/components/SupabaseProvider';

import AdminNavigation from './dashboard/admin/components/AdminNavigation';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      setIsAdmin(profile?.role === 'admin');
    }
    checkRole();
  }, [supabase]);

  if (isAdmin === null) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div></div>;
  }

  return (
    <SupabaseProvider>
      <div className="container">
        {isAdmin && <AdminNavigation />}
      </div>
      {children}
    </SupabaseProvider>
  );
}
