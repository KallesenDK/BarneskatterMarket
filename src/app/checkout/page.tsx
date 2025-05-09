'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { useSupabase } from '@/components/SupabaseProvider';
import { getUserSubscription } from '@/lib/api';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  duration_weeks: number;
  product_limit: number;
  price: number;
  is_active: boolean;
  stripe_price_id: string; // <-- Stripe Price ID
}


interface ProductSlot {
  id: string;
  name: string;
  description: string | null;
  slot_count: number;
  price: number;
  is_active: boolean;
  stripe_price_id: string; // <-- Stripe Price ID
}

function CheckoutPage() {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get('items');
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (itemsParam) {
      try {
        setCartItems(JSON.parse(decodeURIComponent(itemsParam)));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, [itemsParam]);
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        // Findes der slots i kurven?
        const hasSlot = cartItems.some(item => item.type === 'slot' || item.slot_count !== undefined);
        // Findes der abonnementspakke i kurven?
        const hasPackage = cartItems.some(item => item.type === 'package' || item.duration_weeks !== undefined);
        if (hasSlot && !hasPackage) {
          // Tjek kun brugerens aktive abonnement hvis der ikke købes abonnement nu
          const subscription = await getUserSubscription(user.id);
          setHasActiveSubscription(!!subscription);
          if (!subscription) {
            setError('Du skal have et aktivt abonnement for at købe produktpladser. Tilføj en pakke til kurven eller køb kun produkter.');
          }
        } else {
          setHasActiveSubscription(true); // ingen blokering
        }
      } catch (error) {
        console.error('Fejl ved hentning af data:', error);
        setError('Der opstod en fejl ved indlæsning af data');
      }
    };
    checkSubscriptionStatus();
  }, [cartItems, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('FORM SUBMIT CALLED'); // Debug!
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Byg cartItems til Stripe (kun dem med stripe_price_id)
      const stripeCartItems = cartItems
        .filter(item => item.stripe_price_id)
        .map(item => ({
          stripe_price_id: item.stripe_price_id,
          quantity: item.quantity || 1,
        }));
      if (stripeCartItems.length === 0) throw new Error('Ingen produkter med Stripe price sat i kurven.');
      // Check for slot-krav
      const hasSlot = cartItems.some(item => item.type === 'slot' || item.slot_count !== undefined);
      const hasPackage = cartItems.some(item => item.type === 'package' || item.duration_weeks !== undefined);
      if (hasSlot && !hasPackage && !hasActiveSubscription) {
        setError('Du skal have et aktivt abonnement for at købe produktpladser. Tilføj en pakke til kurven eller køb kun produkter.');
        setIsProcessing(false);
        return;
      }
      console.log('cartItems:', cartItems);
      console.log('stripeCartItems:', stripeCartItems);
      console.log('formData:', formData);
      const res = await fetch('/api/create-cart-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: stripeCartItems,
          customerInfo: {
            email: formData.email,
            name: formData.name,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
          },
          successUrl: window.location.origin + '/checkout/success',
          cancelUrl: window.location.origin + '/checkout/cancel',
        }),
      });
      const data = await res.json();
      console.log('Stripe response:', data);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Stripe Checkout fejl');
      }
    } catch (error: any) {
      setError(error.message || 'Der opstod en fejl under betaling');
    } finally {
      setIsProcessing(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tak for dit køb!</h2>
          <p className="text-gray-600 mb-6">
            Din ordre er blevet bekræftet. Du vil modtage en bekræftelse på email.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#1AA49A] hover:bg-[#158C84]"
          >
            Gå til dashboard
          </Link>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fejl</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {!hasActiveSubscription && (
            <Link 
              href="/packages"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#1AA49A] hover:bg-[#158C84]"
            >
              Se pakker
            </Link>
          )}

        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <Link 
          href={cartItems.length === 0 ? "/dashboard" : "/product-slots"}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ordre oversigt */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ordre oversigt</h2>

            {/* Vis varer fra cartItems hvis de findes */}
            {cartItems.length > 0 && (
              <div className="mb-4">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex items-center gap-4 py-2">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded border" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                      </div>
                      <div className="font-semibold whitespace-nowrap">{item.price?.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' }) || ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fjernet selectedPackage/selectedSlot visning - alt vises via cartItems */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">
                  {cartItems.length > 0
                    ? cartItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })
                    : '0,00 kr.'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Betalingsformular */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Betalingsoplysninger</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Navn</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">By</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postnummer</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#1AA49A] focus:ring-[#1AA49A]"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#1AA49A] text-white py-3 px-4 rounded-md hover:bg-[#158C84] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  console.log('CLICK: isProcessing', isProcessing);
                  console.log('selectedPackage', selectedPackage);
                  console.log('selectedSlot', selectedSlot);
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Behandler...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Betal nu
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Indlæser…</div>}>
      <CheckoutPage />
    </Suspense>
  );
}