'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserNavigation from './components/UserNavigation';

export default function UserDashboardPage() {
  const { supabase } = useSupabase();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let extraSlots = 0;
      if (user) {
        // Hent profil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Hent aktivt abonnement (nyeste hvis flere)
        const { data: subscriptionData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        console.log('SUBSCRIPTION DATA:', subscriptionData);

        if (subError) {
          console.error('Fejl ved hentning af abonnement:', subError);
        }

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

        // Hent ekstra produktpladser fra user_product_slots
        const { data: userSlotsData } = await supabase
          .from('user_product_slots')
          .select('slots')
          .eq('user_id', user.id);
        if (userSlotsData && Array.isArray(userSlotsData)) {
          extraSlots = userSlotsData.reduce((sum, row) => sum + (row.slots || 0), 0);
        }

        setSubscription({
          ...subscriptionData,
          plan: planData,
          extraSlots,
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
              {
                // Beregn produktpladser
                (() => {
                  const baseSlots = subscription?.plan?.product_limit ?? 0;
                  const extraSlots = subscription?.extraSlots ?? 0;
                  const totalSlots = baseSlots + extraSlots;
                  const usedSlots = products.length;
                  const availableSlots = Math.max(totalSlots - usedSlots, 0);
                  return (
                    <p className="text-gray-600">
                      Du har <span className="font-medium text-[#1AA49A]">{availableSlots}</span> ledige produktpladser ud af <span className="font-medium text-[#BC1964]">{totalSlots}</span> i alt
                    </p>
                  );
                })()
              }
              {
                // Beregn dage tilbage
                (() => {
                  let daysRemaining = 0;
                  if (subscription?.starts_at) {
                    const start = new Date(subscription.starts_at);
                    let end: Date | null = null;
                    if (subscription.ends_at) {
                      end = new Date(subscription.ends_at);
                    } else if (subscription?.plan?.duration_days) {
                      end = new Date(start.getTime() + subscription.plan.duration_days * 24 * 60 * 60 * 1000);
                    } else {
                      end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // fallback 30 dage
                    }
                    const now = new Date();
                    if (end > now) {
                      daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    }
                  }
                  return (
                    <p className="text-gray-600">
                      Du har <span className="font-medium text-[#1AA49A]">{daysRemaining}</span> dage tilbage af dit abonnement
                    </p>
                  );
                })()
              }
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

      

      {/* Produkter sektion */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dine produkter til salg</h2>
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
            {products.map((product: any) => {
              // Find første billede, hvis det findes (ellers vis placeholder)
              const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/no-image.svg';
              return (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-shadow min-h-[320px] flex flex-col p-5 group"
                >
                  <div className="flex justify-center mb-4">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="h-36 w-36 object-cover rounded-xl border border-gray-100 shadow-sm bg-white group-hover:scale-105 transition-transform duration-200"
                      onError={e => { (e.target as HTMLImageElement).src = '/no-image.svg'; }}
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate text-center">{product.title}</h3>
                  <p className="text-[#BC1964] font-bold text-xl text-center mb-2">{product.price} kr.</p>
                  <div className="flex-1" />
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.status === 'active' ? 'Aktiv' : 'Kladde'}
                    </span>
                    <Link
                      href={`/dashboard/user/products/${product.id}`}
                      className="inline-block bg-[#1AA49A] text-white px-3 py-1 rounded-lg font-medium shadow hover:bg-[#158F86] transition-colors text-xs"
                    >
                      Rediger
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}