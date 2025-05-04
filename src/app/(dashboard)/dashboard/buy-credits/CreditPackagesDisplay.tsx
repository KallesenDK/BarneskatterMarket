'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatMoney } from '@/lib/utils';

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  active: boolean;
};

export default function CreditPackagesDisplay({ userId }: { userId: string }) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [packages, setPackages] = useState<CreditPackage[]>([
    {
      id: '1',
      name: 'Starter Pakke',
      credits: 10,
      price: 99,
      active: true
    },
    {
      id: '2',
      name: 'Standard Pakke',
      credits: 25,
      price: 199,
      active: true
    },
    {
      id: '3',
      name: 'Premium Pakke',
      credits: 50,
      price: 349,
      active: true
    },
    {
      id: '4',
      name: 'Pro Pakke',
      credits: 100,
      price: 599,
      active: true
    }
  ]);
  
  const supabase = createClientComponentClient();
  
  // Her ville vi normalt hente pakker fra databasen
  // useEffect(() => {
  //   const fetchPackages = async () => {
  //     const { data, error } = await supabase
  //       .from('credit_packages')
  //       .select('*')
  //       .eq('active', true);
  //     
  //     if (error) {
  //       setError('Kunne ikke hente kredit pakker');
  //       return;
  //     }
  //     
  //     setPackages(data);
  //   };
  //   
  //   fetchPackages();
  // }, [supabase]);
  
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setError(null);
  };
  
  const handlePurchase = async () => {
    if (!selectedPackage) {
      setError('Vælg venligst en pakke først');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
      
      if (!selectedPkg) {
        throw new Error('Ugyldig pakke valgt');
      }
      
      // Her ville vi normalt integrere med Stripe for betaling
      // For demonstrationsformål simulerer vi en vellykket betaling og opdaterer brugerkreditter
      
      // 1. Hent nuværende bruger
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      // 2. Opdater brugerens kreditter
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          credits: userData.credits + selectedPkg.credits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // 3. Registrer transaktion (i et rigtigt system)
      // Dette ville inkludere detaljer om betalingen
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Fejl ved køb af kreditter:', err);
      setError(err.message || 'Der opstod en fejl ved køb af pakken');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Køb gennemført!</h2>
        <p className="text-gray-600 mb-6">
          Din konto er blevet opdateret med nye kreditter.
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
        >
          Tilbage til oversigt
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`border rounded-lg p-6 transition-all cursor-pointer ${
              selectedPackage === pkg.id 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => handleSelectPackage(pkg.id)}
          >
            <h3 className="font-bold text-lg text-gray-900 mb-2">{pkg.name}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">{formatMoney(pkg.price)}</div>
            <p className="text-gray-500 mb-4">
              {pkg.credits} kreditter
            </p>
            
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-blue-600"
                  checked={selectedPackage === pkg.id}
                  onChange={() => handleSelectPackage(pkg.id)}
                />
                <span className="ml-2 text-gray-700">Vælg</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handlePurchase}
          disabled={!selectedPackage || isLoading}
          className={`px-6 py-2 rounded-md font-medium ${
            !selectedPackage || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Behandler...' : 'Fortsæt til betaling'}
        </button>
      </div>
    </div>
  );
} 