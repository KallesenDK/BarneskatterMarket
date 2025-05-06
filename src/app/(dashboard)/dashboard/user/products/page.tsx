'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
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
  images: string[]; // Added for thumbnail and gallery support
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
              href="/dashboard/user"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/user'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Oversigt
            </Link>
            <Link
              href="/dashboard/user/products"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/user/products'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Mine produkter
            </Link>
            <Link
              href="/dashboard/user/create-product"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/user/create-product'
                  ? 'border-[#BC1964] text-[#BC1964]'
                  : 'border-transparent text-gray-500 hover:text-[#1AA49A] hover:border-[#1AA49A]'
              }`}
            >
              Opret produkt
            </Link>
            <Link
              href="/dashboard/user/messages"
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                pathname === '/dashboard/user/messages'
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
            Opgrader pakke
          </Link>
          <Link
            href="/product-slots"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BC1964] hover:bg-[#A01453] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BC1964]"
          >
            Køb flere pladser
          </Link>
          <Link
            href="/dashboard/user/create-product"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1AA49A] hover:bg-[#158F86] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1AA49A]"
          >
            Opret produkt
          </Link>
        </div>
      </div>

      {notifications.map(notification => (
        <Toast
          key={notification.id}
          variant={notification.type === 'error' ? 'destructive' : 'default'}
        >
          {notification.message}
        </Toast>
      ))}

      {selectedProducts.length > 0 && (
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selectedProducts.length} produkt{selectedProducts.length > 1 ? 'er' : ''} valgt
          </p>
          <button
            onClick={handleDeleteSelected}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Slet valgte
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-gray-300 rounded"
                  checked={selectedProducts.length === products.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(products.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produkt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pris
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oprettet
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-gray-300 rounded"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {Array.isArray(product.images) && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatMoney(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRelativeDate(product.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/user/products/${product.id}`}
                    className="text-[#1AA49A] hover:text-[#158F86]"
                  >
                    Rediger
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 