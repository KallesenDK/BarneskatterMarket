'use client';
export const dynamic = "force-dynamic";
import DashboardClientProvider from '../DashboardClientProvider';
import { usePathname } from 'next/navigation'
import AdminNavigation from './components/AdminNavigation';
import { 
  LayoutDashboard,
  Users,
  Package,
  Grid,
  MessageSquare,
  ShoppingCart,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Brugere', href: '/dashboard/admin/users', icon: Users },
  { name: 'Pakker', href: '/dashboard/admin/packages', icon: Package },
  { name: 'Produkt Pladser', href: '/dashboard/admin/product-slots', icon: Grid },
  { name: 'Beskeder', href: '/dashboard/admin/messages', icon: MessageSquare },
  { name: 'Ordrer', href: '/dashboard/admin/orders', icon: ShoppingCart },
  { name: 'Indstillinger', href: '/dashboard/admin/settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div>
      <AdminNavigation />
      <main className="p-0">
        {children}
      </main>
    </div>
  )
}