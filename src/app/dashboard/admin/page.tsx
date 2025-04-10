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

// Statistikker
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
    icon: Package
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

// Seneste ordrer
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

export default function AdminDashboard() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/auth/signin'
        return
      }
      setLoading(false)
    }

    checkSession()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    )
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
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500">{stat.title}</div>
                    <div className="mt-2 flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
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
                  <div className="flex items-center justify-center rounded-full bg-[#1AA49A]/10 p-3">
                    <Icon className="h-6 w-6 text-[#1AA49A]" />
                  </div>
                </div>
              </div>
            </Card>
          )
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
              {recentOrders.map((order, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 