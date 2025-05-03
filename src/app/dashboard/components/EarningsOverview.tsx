'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export default function EarningsOverview({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [earnings, setEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('amount')
          .eq('seller_id', userId)
          .eq('status', 'completed');

        if (error) throw error;

        // Beregn total indtjening
        const total = data?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        setEarnings(total);
      } catch (error) {
        console.error('Fejl ved hentning af indtjening:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#1AA49A]">
        <h2 className="text-xl font-semibold text-gray-900">
          Total indtjening
        </h2>
      </div>

      <div className="p-6">
        <div className="text-3xl font-bold text-gray-900">{formatMoney(earnings)} kr</div>
        <p className="text-sm text-gray-500 mt-1">
          Samlet indtjening (efter provision)
        </p>
      </div>
    </div>
  );
} 