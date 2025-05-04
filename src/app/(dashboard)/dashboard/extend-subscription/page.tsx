'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../components/DashboardHeader';

const subscriptionPlans = [
  { id: 'basic', duration: 1, name: 'Basis', price: 99, description: '1 måned, op til 10 annoncer' },
  { id: 'standard', duration: 3, name: 'Standard', price: 249, description: '3 måneder, op til 20 annoncer', popular: true },
  { id: 'premium', duration: 6, name: 'Premium', price: 449, description: '6 måneder, ubegrænset annoncer' },
];

export default function ExtendSubscriptionPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        // Hent bruger
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Hent abonnement
        const { data: subscriptions, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (subscriptions && subscriptions.length > 0) {
          setCurrentPlan(subscriptions[0]);
          setExpiryDate(new Date(subscriptions[0].expires_at));
        } else {
          // Hvis ingen aktiv abonnement, redirect til køb
          router.push('/dashboard/buy-credits');
        }
      } catch (error) {
        console.error('Fejl ved hentning af abonnement:', error);
      }
    };
    
    fetchCurrentSubscription();
  }, [supabase, router]);
  
  const handleExtend = async () => {
    setLoading(true);
    
    try {
      // Simuleret forlængelse - i en rigtig app ville dette involvere betaling
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      
      if (!plan || !expiryDate) return;
      
      // Beregn ny udløbsdato (tilføj plan.duration måneder)
      const newExpiryDate = new Date(expiryDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + plan.duration);
      
      // Opdater abonnement i databasen
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          price: plan.price,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: newExpiryDate.toISOString(),
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Opdater det tidligere abonnement til 'replaced'
      if (currentPlan) {
        await supabase
          .from('subscriptions')
          .update({ status: 'replaced' })
          .eq('id', currentPlan.id);
      }
      
      // Redirect til dashboard
      router.push('/dashboard?extended=true');
      
    } catch (error) {
      console.error('Fejl ved forlængelse af abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentPlan || !expiryDate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded max-w-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Forlæng dit abonnement</h1>
          <p className="text-gray-600 mt-2">
            Dit nuværende abonnement udløber {expiryDate.toLocaleDateString('da-DK')}. Forlæng det nu for at beholde alle fordele.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
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
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <p className="text-sm text-gray-500">
                  {plan.duration} {plan.duration === 1 ? 'måned' : 'måneder'}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-700 font-medium">Valgt plan:</p>
                <p className="text-lg font-semibold">
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.name} - 
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.price} kr
                </p>
              </div>
              <button
                onClick={handleExtend}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Behandler...' : 'Forlæng abonnement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 