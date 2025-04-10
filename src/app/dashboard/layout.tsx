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
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Brugere', href: '/dashboard/admin/users', icon: Users },
  { name: 'Pakker', href: '/dashboard/admin/packages', icon: Package },
  { name: 'Beskeder', href: '/dashboard/admin/messages', icon: MessageSquare },
  { name: 'Ordrer', href: '/dashboard/admin/orders', icon: ShoppingCart },
  { name: 'Indstillinger', href: '/dashboard/admin/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 