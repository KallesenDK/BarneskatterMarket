'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MessageSquare, 
  ShoppingCart, 
  Settings,
  CreditCard
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Brugere', href: '/dashboard/admin/users', icon: Users },
  { name: 'Pakker', href: '/dashboard/admin/packages', icon: Package },
  { name: 'Kredit Pakker', href: '/dashboard/admin/credit-packages', icon: CreditCard },
  { name: 'Beskeder', href: '/dashboard/admin/messages', icon: MessageSquare },
  { name: 'Ordrer', href: '/dashboard/admin/orders', icon: ShoppingCart },
  { name: 'Indstillinger', href: '/dashboard/admin/settings', icon: Settings },
]

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-[240px] bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="text-lg font-semibold text-[#1AA49A]">Admin Dashboard</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${isActive 
                    ? 'text-[#1AA49A] bg-[#1AA49A]/5' 
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[#1AA49A]' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-[#1AA49A]/10 flex items-center justify-center">
                <span className="text-sm font-medium text-[#1AA49A]">A</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin Bruger</p>
              <p className="text-xs text-gray-500">kenneth@sigmatic.dk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <main className="py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  )
} 