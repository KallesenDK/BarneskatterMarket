'use client';

import { useSupabase } from '@/components/SupabaseProvider';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  status: string;
}

export default function UserProductsOverview({ userId }: { userId: string }) {
  const { supabase } = useSupabase();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Fejl ved hentning af produkter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [supabase, userId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1AA49A]"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dine produkter</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Du har ingen produkter endnu</p>
          <Link
            href="/dashboard/main/create-product"
            className="inline-block bg-[#1AA49A] text-white px-4 py-2 rounded-md hover:bg-[#1AA49A]/90"
          >
            Opret dit første produkt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dine produkter</h2>
          <Link
            href="/dashboard/main/create-product"
            className="bg-[#1AA49A] text-white px-4 py-2 rounded-md hover:bg-[#1AA49A]/90"
          >
            Opret nyt produkt
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{product.title}</h3>
              <p className="text-gray-600 mb-2">{product.price} kr.</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-sm ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status === 'active' ? 'Aktiv' : 'Kladde'}
                </span>
                <Link
                  href={`/dashboard/main/products/${product.id}`}
                  className="text-[#1AA49A] hover:underline"
                >
                  Rediger
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 