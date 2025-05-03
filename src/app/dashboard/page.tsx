import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardClient from './DashboardClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card'
import { Users, Package2, MessageSquare, ShoppingCart } from 'lucide-react'

// Fallback komponent ved fejl
function AuthError() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Adgang nægtet</h1>
        <p className="text-gray-600 mb-6">
          Din session kunne ikke valideres. Du skal logge ind for at få adgang til dashboard.
        </p>
        <Link 
          href="/auth/signin"
          className="block w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 text-center"
        >
          Gå til login
        </Link>
      </div>
    </div>
  );
}

const stats = [
  {
    title: 'Total Brugere',
    value: '120',
    change: '+12%',
    changeType: 'increase',
    icon: Users
  },
  {
    title: 'Aktive Pakker',
    value: '45',
    change: '+8%',
    changeType: 'increase',
    icon: Package2
  },
  {
    title: 'Nye Beskeder',
    value: '23',
    change: '-5%',
    changeType: 'decrease',
    icon: MessageSquare
  },
  {
    title: 'Ordrer i Dag',
    value: '8',
    change: '+20%',
    changeType: 'increase',
    icon: ShoppingCart
  }
]

const recentOrders = [
  {
    kunde: 'Anders Hansen',
    beløb: 'kr 2.999',
    status: 'Betalt',
    dato: '10 min siden'
  },
  {
    kunde: 'Marie Jensen',
    beløb: 'kr 1.499',
    status: 'Afventer',
    dato: '2 timer siden'
  },
  {
    kunde: 'Peter Nielsen',
    beløb: 'kr 4.999',
    status: 'Betalt',
    dato: '3 timer siden'
  }
]

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    // Tjek om vi kommer fra login-siden med auth-parameter
    const authParam = searchParams.auth;
    
    // Opret Supabase klient med cookies fra anmodningen
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });
    
    // Tjek om brugeren er logget ind
    const { data, error } = await supabase.auth.getSession();
    
    if (!data.session) {
      return <AuthError />;
    }

    // Tjek om brugeren er admin
    const isAdmin = data.session.user.email === 'kenneth@sigmatic.dk';
    
    // Omdiriger baseret på brugerens rolle
    if (isAdmin) {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard/user');
    }
    
  } catch (error) {

    return <AuthError />;
  }
}

// export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Statistik kort */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{stat.value}</div>
                    <span 
                      className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'increase' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-full bg-gray-50 p-2">
                  <Icon className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Seneste ordrer */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Seneste Ordrer</h2>
            <button className="text-[#1AA49A] hover:text-[#1AA49A]/80">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KUNDE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BELØB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DATO
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 