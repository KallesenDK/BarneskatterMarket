'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { useSupabase } from '@/components/SupabaseProvider';
import { SubscriptionPackage } from '@/lib/types';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    const packageId = searchParams.get('package');
    if (packageId) {
      const fetchPackage = async () => {
        try {
          const { data, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .eq('id', packageId)
            .single();

          if (error) throw error;
          if (data) setSelectedPackage(data);
        } catch (error) {
          console.error('Fejl ved hentning af pakke:', error);
          setError('Der opstod en fejl ved indlæsning af den valgte pakke');
        }
      };

      fetchPackage();
    }
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Simuler en betalingsprocess
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Her ville du normalt sende ordren til din backend
      
      setSuccess(true);
    } catch (error) {
      setError('Der opstod en fejl under behandling af din betaling');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingen pakke valgt</h2>
          <p className="text-gray-600 mb-6">Vælg venligst en pakke før du fortsætter til checkout.</p>
          <Link 
            href="/packages"
            className="inline-block bg-[#1AA49A] text-white px-6 py-3 rounded-md font-medium hover:bg-[#158F86] transition-colors"
          >
            Se pakker
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tak for din ordre!</h2>
          <p className="text-gray-600 mb-6">Vi har modtaget din ordre og vil behandle den hurtigst muligt.</p>
          <Link 
            href="/dashboard"
            className="inline-block bg-[#1AA49A] text-white px-6 py-3 rounded-md font-medium hover:bg-[#158F86] transition-colors"
          >
            Gå til dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/packages" className="inline-flex items-center text-[#1AA49A] hover:underline mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Tilbage til pakker
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Venstre side - Betalingsformular */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Kontaktinformation */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Kontaktinformation</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Fulde navn
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Leveringsadresse */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Leveringsadresse</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Postnummer
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          By
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Betalingsinformation */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Betalingsinformation</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Kortnummer
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                          Udløbsdato
                        </label>
                        <input
                          type="text"
                          id="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="MM/ÅÅ"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                          Sikkerhedskode
                        </label>
                        <input
                          type="text"
                          id="cardCvc"
                          value={formData.cardCvc}
                          onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#1AA49A] text-white py-3 px-4 rounded-md font-medium hover:bg-[#158F86] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Behandler betaling...
                    </span>
                  ) : (
                    `Betal ${selectedPackage.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Højre side - Ordreopsummering */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit lg:sticky lg:top-8">
            <h2 className="text-lg font-semibold mb-4">Din ordre</h2>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedPackage.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedPackage.description}</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-500">
                    <li>• {selectedPackage.product_limit} produkter</li>
                    <li>• {selectedPackage.duration_weeks} ugers abonnement</li>
                  </ul>
                </div>
                <span className="font-medium text-gray-900">
                  {selectedPackage.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between font-medium">
                <span className="text-base">Total</span>
                <span className="text-lg text-[#1AA49A]">
                  {selectedPackage.price.toLocaleString('da-DK', { style: 'currency', currency: 'DKK' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 