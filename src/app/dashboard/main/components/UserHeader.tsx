'use client';

import { useSupabase } from '@/components/SupabaseProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserHeader() {
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };

    getProfile();
  }, [supabase]);

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center py-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Velkommen {profile?.first_name}
          </h1>
        </div>
        <nav className="flex space-x-4">
          <Link 
            href="/dashboard/main/products" 
            className="text-gray-600 hover:text-gray-900"
          >
            Mine Produkter
          </Link>
          <Link 
            href="/dashboard/main/create-product" 
            className="text-gray-600 hover:text-gray-900"
          >
            Opret Produkt
          </Link>
          <Link 
            href="/dashboard/main/orders" 
            className="text-gray-600 hover:text-gray-900"
          >
            Ordrer
          </Link>
          <Link 
            href="/dashboard/main/messages" 
            className="text-gray-600 hover:text-gray-900"
          >
            Beskeder
          </Link>
        </nav>
      </div>
    </header>
  );
} 