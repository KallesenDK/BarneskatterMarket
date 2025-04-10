'use client';

import { 
  Users, 
  Package, 
  MessageSquare, 
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Dette ville normalt komme fra en API
const stats = [
  {
    name: 'Total Brugere',
    value: '2,451',
    change: '+12.5%',
    increasing: true,
    icon: Users,
  },
  {
    name: 'Aktive Pakker',
    value: '154',
    change: '+4.2%',
    increasing: true,
    icon: Package,
  },
  {
    name: 'Nye Beskeder',
    value: '23',
    change: '-5.1%',
    increasing: false,
    icon: MessageSquare,
  },
  {
    name: 'Ordrer i Dag',
    value: '45',
    change: '+8.3%',
    increasing: true,
    icon: ShoppingCart,
  },
];

const recentOrders = [
  {
    id: '1',
    customer: 'Anders Hansen',
    amount: 2999,
    status: 'Betalt',
    date: '10 min siden',
  },
  {
    id: '2',
    customer: 'Marie Jensen',
    amount: 1499,
    status: 'Afventer',
    date: '25 min siden',
  },
  {
    id: '3',
    customer: 'Peter Nielsen',
    amount: 4999,
    status: 'Betalt',
    date: '1 time siden',
  },
  {
    id: '4',
    customer: 'Sofie Larsen',
    amount: 999,
    status: 'Annulleret',
    date: '2 timer siden',
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86]">
          <TrendingUp className="h-5 w-5 mr-2" />
          Se Rapport
        </button>
      </div>

      {/* Statistik kort */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.increasing ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.increasing ? (
                            <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" />
                          )}
                          <span className="ml-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seneste ordrer */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Seneste Ordrer</h2>
          <button 
            className="text-sm font-medium text-[#1AA49A] hover:text-[#158F86]"
          >
            Se alle ordrer
          </button>
        </div>
        <div className="border-t border-gray-200 divide-y divide-gray-200">
          {recentOrders.map((order) => (
            <div key={order.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ordre #{order.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-900 mr-4">
                    {order.amount.toLocaleString('da-DK', {
                      style: 'currency',
                      currency: 'DKK',
                    })}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === 'Betalt' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Afventer' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {order.status}
                  </span>
                  <div className="text-sm text-gray-500 ml-4">
                    {order.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 