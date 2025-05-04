'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Oversigt', href: '/dashboard/user' },
  { name: 'Mine Produkter', href: '/dashboard/user/products' },
  { name: 'Opret Produkt', href: '/dashboard/user/products/create' },
  { name: 'Mine Ordrer', href: '/dashboard/user/orders' },
  { name: 'Beskeder', href: '/dashboard/user/messages' },
  { name: 'Indstillinger', href: '/dashboard/user/settings' },
];

export default function UserNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mb-8">
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname === item.href
                  ? 'border-[#1AA49A] text-[#1AA49A]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 