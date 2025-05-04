'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../components/DashboardHeader';

const storagePlans = [
  { id: 'small', storage: 2, name: 'Basis', price: 49, description: '2 GB billedopbevaring' },
  { id: 'medium', storage: 5, name: 'Standard', price: 99, description: '5 GB billedopbevaring', popular: true },
  { id: 'large', storage: 10, name: 'Premium', price: 179, description: '10 GB billedopbevaring' },
  { id: 'enterprise', storage: 25, name: 'Erhverv', price: 299, description: '25 GB billedopbevaring' },
];

export default function BuyStoragePage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('medium');
  const [currentStorage, setCurrentStorage] = useState(0);
  const [usedStorage, setUsedStorage] = useState(0);
  
  useEffect(() => {
    const fetchStorageInfo = async () => {
      try {
        // Hent bruger
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Hent profil for at se nuværende lagerplads
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('storage_limit, storage_used')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (profile) {
          setCurrentStorage(profile.storage_limit || 1); // Standard 1GB hvis intet er sat
          setUsedStorage(profile.storage_used || 0);
        }
      } catch (error) {
        console.error('Fejl ved hentning af lagerinfo:', error);
      }
    };
    
    fetchStorageInfo();
  }, [supabase, router]);
  
  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Find den valgte plan
      const plan = storagePlans.find(p => p.id === selectedPlan);
      
      if (!plan) return;
      
      // I en rigtig app ville der være en betalingsproces her
      
      // Opdater brugerens lagerplads i databasen
      const { error } = await supabase
        .from('profiles')
        .update({
          storage_limit: currentStorage + plan.storage
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Opret faktura/ordrehistorik
      await supabase
        .from('orders')
        .insert({
          user_id: userId,
          item_type: 'storage',
          item_id: plan.id,
          amount: plan.price,
          description: `Tilkøb af ${plan.storage} GB lagerplads`,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      
      // Redirect til dashboard
      router.push('/dashboard?storageAdded=true');
      
    } catch (error) {
      console.error('Fejl ved køb af lagerplads:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (currentStorage === 0) return 0;
    const percentage = (usedStorage / currentStorage) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Køb mere lagerplads</h1>
          <p className="text-gray-600 mt-2">
            Tilføj mere plads til dine produktbilleder og filer. Din nuværende lagerplads:
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{usedStorage.toFixed(2)} GB brugt af {currentStorage} GB</span>
              <span className="text-sm font-medium">{calculateProgress().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${calculateProgress() > 90 ? 'bg-red-600' : calculateProgress() > 70 ? 'bg-yellow-400' : 'bg-blue-600'}`}
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {storagePlans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`border rounded-lg p-6 cursor-pointer transition-shadow hover:shadow-md relative
                  ${selectedPlan === plan.id ? 'border-blue-500 shadow-sm bg-blue-50' : 'border-gray-200'}
                  ${plan.popular ? 'border-blue-400' : ''}
                `}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Mest populær
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-2">{plan.price} kr</p>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-center mt-4">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">{plan.storage} GB lagerplads</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-700 font-medium">Valgt plan:</p>
                <p className="text-lg font-semibold">
                  {storagePlans.find(p => p.id === selectedPlan)?.name} - 
                  {storagePlans.find(p => p.id === selectedPlan)?.storage} GB ekstra lagerplads for
                  {' '}{storagePlans.find(p => p.id === selectedPlan)?.price} kr
                </p>
              </div>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Behandler...' : 'Gennemfør køb'}
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              * Dit køb tillægges automatisk din nuværende lagerplads. Lagerplads udløber ikke og er tilgængelig så længe du har en aktiv profil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 