'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label?: string;
}

export default function BackButton({ href, label = 'Tilbage' }: BackButtonProps) {
  return (
    <Link 
      href={href}
      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      {label}
    </Link>
  );
} 