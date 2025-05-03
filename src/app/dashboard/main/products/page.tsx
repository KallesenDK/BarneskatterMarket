'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import Navigation from '../components/Navigation';
import { formatMoney, formatRelativeDate } from '@/lib/utils';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Toast } from '@/components/ui/toast';

type Product = {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  expires_at: string | null;
  featured: boolean;
  category_name: string;
  image_url: string | null;
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string, message: string, type: 'success' | 'error' }>>([]);
  
  const justCreated = searchParams.get('created') === 'true';
  
  useEffect(() => {
    if (justCreated) {
      addNotification('Dit produkt er blevet oprettet!', 'success');
    }
  }, [justCreated]);

  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Fejl ved hentning af bruger:', error);
        addNotification('Kunne ikke hente brugeroplysninger. Prøv at genindlæse siden.', 'error');
      }
    };
    
    getUserSession();
  }, [supabase]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Fejl ved hentning af produkter:', error);
        addNotification('Der opstod en fejl ved hentning af dine produkter', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userId, supabase]);

  const handleDeleteSelected = async () => {
    if (!selectedProducts.length) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts)
        .eq('user_id', userId);

      if (error) throw error;

      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      addNotification('De valgte produkter er blevet slettet', 'success');
    } catch (error) {
      console.error('Fejl ved sletning af produkter:', error);
      addNotification('Der opstod en fejl ved sletning af produkterne', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
            Aktiv
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
            Kladde
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/dashboard/main"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/main'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Oversigt
            </Link>
            <Link
              href="/dashboard/main/products"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/main/products'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Mine produkter
            </Link>
            <Link
              href="/dashboard/main/create-product"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/main/create-product'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Opret produkt
            </Link>
            <Link
              href="/dashboard/main/messages"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/main/messages'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Beskeder
            </Link>
          </nav>
        </div>
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mine produkter</h1>
        <div className="flex gap-4">
          <Link
            href="/packages"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A]"
          >
            Køb pakke
          </Link>
          <Link
            href="/product-slots"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC1964]"
          >
            Køb mere plads
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <Link
            href="/dashboard/main"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/main'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Oversigt
          </Link>
          <Link
            href="/dashboard/main/products"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/main/products'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Mine produkter
          </Link>
          <Link
            href="/dashboard/main/create-product"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/main/create-product'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Opret produkt
          </Link>
          <Link
            href="/dashboard/main/messages"
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              pathname === '/dashboard/main/messages'
                ? 'border-[#BC1964] text-[#BC1964]'
                : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
            }`}
          >
            Beskeder
          </Link>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Du har ingen produkter endnu</p>
            <Link
              href="/dashboard/main/create-product"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC1964]"
            >
              Opret dit første produkt
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={product.image_url || '/placeholder-product.png'}
                    alt={product.title}
                    className="object-cover rounded-md"
                  />
                </div>
                <h3 className="font-medium text-lg mb-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#BC1964]">
                    {product.price} kr.
                  </span>
                  <Link
                    href={`/dashboard/main/products/edit/${product.id}`}
                    className="text-sm text-[#1AA49A] hover:text-[#158F86] font-medium"
                  >
                    Rediger
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 