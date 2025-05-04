'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Oversigt', href: '/dashboard/main' },
  { name: 'Mine produkter', href: '/dashboard/main/products' },
  { name: 'Opret produkt', href: '/dashboard/main/create-product' },
  { name: 'Beskeder', href: '/dashboard/main/messages' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium border-b-2 transition-colors
                  ${isActive 
                    ? 'border-[#BC1964] text-[#BC1964]' 
                    : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'}
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 