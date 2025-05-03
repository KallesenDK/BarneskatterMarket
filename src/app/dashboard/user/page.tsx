'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserDashboardPage() {
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Hent profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Hent abonnement
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        console.log('SUBSCRIPTION DATA:', subscriptionData);

        let planData = null;
        if (subscriptionData?.plan_id) {
          // Hent pakken/planen
          const { data } = await supabase
            .from('subscription_packages') // eller 'packages', hvis det er din pakke-tabel
            .select('*')
            .eq('id', subscriptionData.plan_id)
            .single();
          planData = data;
        }

        setSubscription({
          ...subscriptionData,
          plan: planData,
        });

        // Hent produkter
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);
        setProducts(productsData || []);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mit Dashboard</h1>
      </div>

      {/* Velkomst sektion */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-4">Velkommen, {profile?.first_name}</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                Din pakke er: <span className="font-medium text-[#BC1964]">{subscription?.plan?.name || 'Ingen aktiv pakke'}</span>
              </p>
              <p className="text-gray-600">
                Du har <span className="font-medium text-[#1AA49A]">{subscription?.plan?.available_slots ?? 0}</span> ledige produktpladser ud af <span className="font-medium text-[#BC1964]">{subscription?.plan?.total_slots ?? 0}</span> i alt
              </p>
              <p className="text-gray-600">
                {/* Her kan du evt. beregne dage tilbage baseret på starts_at/slutter_at */}
                Du har <span className="font-medium text-[#1AA49A]">{/* Beregn dage tilbage her */}</span> dage tilbage af dit abonnement
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A]"
            >
              Køb pakke
            </Link>
            <Link
              href="/product-slots"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC1964]"
            >
              Køb mere plads
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/dashboard/user"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/user'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Oversigt
          </Link>
          <Link
            href="/dashboard/user/products"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/user/products'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Mine produkter
          </Link>
          <Link
            href="/dashboard/user/create-product"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/user/create-product'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Opret produkt
          </Link>
          <Link
            href="/dashboard/user/messages"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/user/messages'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Beskeder
          </Link>
        </nav>
      </div>

      {/* Produkter sektion */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dine produkter til salg ({products.length} af {subscription?.total_slots || 0})</h2>
          <Link
            href="/dashboard/user/create-product"
            className="bg-[#1AA49A] text-white px-4 py-2 rounded-md hover:bg-[#1AA49A]/90"
          >
            Opret produkt
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Du har ingen produkter til salg.</p>
            <Link
              href="/dashboard/user/create-product"
              className="inline-block bg-[#1AA49A] text-white px-6 py-3 rounded-md hover:bg-[#1AA49A]/90"
            >
              Opret dit første produkt
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-2">{product.price} kr.</p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status === 'active' ? 'Aktiv' : 'Kladde'}
                  </span>
                  <Link
                    href={`/dashboard/user/products/${product.id}`}
                    className="text-[#1AA49A] hover:underline"
                  >
                    Rediger
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 