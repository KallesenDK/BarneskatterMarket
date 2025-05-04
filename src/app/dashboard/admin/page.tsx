'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import { Card } from '@/components/ui/card'
import { 
  Users, 
  Package, 
  MessageSquare, 
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react'

// Statistikker og ordrer dynamisk via state
const statIcons = [Users, Package, MessageSquare, ShoppingCart];

export default function AdminDashboard() {
  type StatType = { title: string; value: string; icon: any };
  type OrderType = { kunde: string; beløb: string; status: string; dato: string };

  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatType[]>([
    { title: 'Total Brugere', value: '-', icon: Users },
    { title: 'Aktive Pakker', value: '-', icon: Package },
    { title: 'Nye Beskeder', value: '-', icon: MessageSquare },
    { title: 'Ordrer i Dag', value: '-', icon: ShoppingCart }
  ]);
  const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }
      // Hent statistik
      const [{ count: userCount }, { count: packageCount }, { count: messageCount }, { count: ordersTodayCount }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscription_packages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().slice(0, 10)),
        supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats([
        { title: 'Total Brugere', value: String(userCount ?? 0), icon: Users },
        { title: 'Aktive Pakker', value: String(packageCount ?? 0), icon: Package },
        { title: 'Nye Beskeder', value: String(messageCount ?? 0), icon: MessageSquare },
        { title: 'Ordrer i Dag', value: String(ordersTodayCount ?? 0), icon: ShoppingCart }
      ]);

      setRecentOrders(
        (orders || []).map((order: any) => ({
          kunde: order.customer_name || 'Ukendt',
          beløb: order.total_amount ? `kr ${order.total_amount}` : '-',
          status: order.status === 'paid' ? 'Betalt' : 'Afventer',
          dato: order.created_at ? new Date(order.created_at).toLocaleString('da-DK') : '-'
        })) as OrderType[]
      );
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Oversigt over din forretning</p>
      </div>

      {/* Statistik kort */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                    <div className="mt-2 flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center rounded-full bg-[#1AA49A]/10 p-3">
                    <Icon className="h-6 w-6 text-[#1AA49A]" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Seneste ordrer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Seneste Ordrer</h2>
            <button className="text-[#1AA49A] hover:text-[#1AA49A]/80 p-1 rounded-full hover:bg-[#1AA49A]/5">
              <ArrowUpRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Beløb
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Dato
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">Ingen ordrer fundet</td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.kunde}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.beløb}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Betalt'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.dato}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  type StatType = { title: string; value: string; icon: any };
type OrderType = { kunde: string; beløb: string; status: string; dato: string };

const [stats, setStats] = useState<StatType[]>([
  { title: 'Total Brugere', value: '-', icon: Users },
  { title: 'Aktive Pakker', value: '-', icon: Package },
  { title: 'Nye Beskeder', value: '-', icon: MessageSquare },
  { title: 'Ordrer i Dag', value: '-', icon: ShoppingCart }
]);
const [recentOrders, setRecentOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/auth/signin';
        return;
      }
      // Hent statistik
      const [{ count: userCount }, { count: packageCount }, { count: messageCount }, { count: ordersTodayCount }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscription_packages').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().slice(0, 10)),
        supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5)
      ]);

      setStats([
        { title: 'Total Brugere', value: String(userCount ?? 0), icon: Users },
        { title: 'Aktive Pakker', value: String(packageCount ?? 0), icon: Package },
        { title: 'Nye Beskeder', value: String(messageCount ?? 0), icon: MessageSquare },
        { title: 'Ordrer i Dag', value: String(ordersTodayCount ?? 0), icon: ShoppingCart }
      ]);

      setRecentOrders(
        (orders || []).map((order: any) => ({
          kunde: order.customer_name || 'Ukendt',
          beløb: order.total_amount ? `kr ${order.total_amount}` : '-',
          status: order.status === 'paid' ? 'Betalt' : 'Afventer',
          dato: order.created_at ? new Date(order.created_at).toLocaleString('da-DK') : '-'
        })) as OrderType[]
      );
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [supabase]);
