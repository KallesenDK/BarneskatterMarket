'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../components/DashboardHeader';

const creditPlans = [
  { id: 'small', credits: 100, name: 'Basis', price: 99, description: '100 point til annoncer', pricePerCredit: 0.99 },
  { id: 'medium', credits: 250, name: 'Standard', price: 199, description: '250 point til annoncer', pricePerCredit: 0.80, popular: true },
  { id: 'large', credits: 500, name: 'Premium', price: 349, description: '500 point til annoncer', pricePerCredit: 0.70 },
  { id: 'enterprise', credits: 1000, name: 'Erhverv', price: 599, description: '1000 point til annoncer', pricePerCredit: 0.60 },
];

export default function BuyCreditsPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('medium');
  const [currentCredits, setCurrentCredits] = useState(0);
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Hent bruger
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Hent profil for at se nuværende point
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (profile) {
          setCurrentCredits(profile.credits || 0);
        }
      } catch (error) {
        console.error('Fejl ved hentning af brugerinfo:', error);
      }
    };
    
    fetchUserInfo();
  }, [supabase, router]);
  
  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Find den valgte plan
      const plan = creditPlans.find(p => p.id === selectedPlan);
      
      if (!plan) return;
      
      // I en rigtig app ville der være en betalingsproces her
      
      // Opdater brugerens point i databasen
      const { error } = await supabase
        .from('profiles')
        .update({
          credits: currentCredits + plan.credits
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Opret faktura/ordrehistorik
      await supabase
        .from('orders')
        .insert({
          user_id: userId,
          item_type: 'credits',
          item_id: plan.id,
          amount: plan.price,
          description: `Køb af ${plan.credits} point`,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      
      // Som en del af købet, opret også et abonnement, hvis der ikke allerede er et
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');
        
      if (!subscriptions || subscriptions.length === 0) {
        // Opret et basis-abonnement på 1 måned
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_id: 'basic',
            price: 0, // Gratis da det er inkluderet i point-købet
            status: 'active',
            starts_at: new Date().toISOString(),
            expires_at: expiryDate.toISOString(),
            created_at: new Date().toISOString()
          });
      }
      
      // Redirect til dashboard
      router.push('/dashboard?creditsAdded=true');
      
    } catch (error) {
      console.error('Fejl ved køb af point:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Køb pakke</h1>
          <p className="text-gray-600 mt-2">
            Point bruges til at oprette annoncer og fremhæve dine produkter. Du har i øjeblikket <span className="font-semibold">{currentCredits}</span> point.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {creditPlans.map((plan) => (
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
                <div className="flex items-center mt-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">{plan.credits} point</span>
                </div>
                <div className="flex items-center mt-1">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">Kun {plan.pricePerCredit.toFixed(2)} kr pr. point</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-700 font-medium">Valgt pakke:</p>
                <p className="text-lg font-semibold">
                  {creditPlans.find(p => p.id === selectedPlan)?.name} - 
                  {creditPlans.find(p => p.id === selectedPlan)?.credits} point for
                  {' '}{creditPlans.find(p => p.id === selectedPlan)?.price} kr
                </p>
              </div>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Behandler...' : 'Køb pakke'}
              </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mt-6 border border-blue-100">
              <h4 className="text-blue-700 font-medium mb-2">Bemærk:</h4>
              <p className="text-sm text-blue-600">
                Ved at købe en pakke aktiverer du også en måneds adgang til alle platformens funktioner.
                Hvis du allerede har et aktivt abonnement, vil dit pakkekøb ikke påvirke dette, men kun tilføje flere point til din konto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 