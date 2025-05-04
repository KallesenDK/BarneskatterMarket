'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface Payout {
  id: string;
  created_at: string;
  amount: number;
  status: string;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export default function PayoutsOverview({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const { data, error } = await supabase
          .from('payouts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setPayouts(data || []);
      } catch (error) {
        console.error('Fejl ved hentning af udbetalinger:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#1AA49A]">
        <h2 className="text-xl font-semibold text-gray-900">
          Seneste udbetalinger
        </h2>
      </div>

      <div className="overflow-x-auto">
        {payouts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Ingen udbetalinger endnu
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beløb
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(payout.created_at), 'PPP', { locale: da })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatMoney(payout.amount)} kr
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payout.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : payout.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payout.status === 'completed' ? 'Gennemført' :
                       payout.status === 'pending' ? 'Under behandling' : 'Fejlet'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 