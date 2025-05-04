'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSupabase } from '@/components/SupabaseProvider';
import ProductForm from '../ProductForm';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
};

type PackageType = 'starter' | 'basic' | 'pro' | 'business';

const PACKAGE_LIMITS = {
  starter: { productLimit: 4, maxAnnonceWeeks: 2 },
  basic: { productLimit: 6, maxAnnonceWeeks: 4 },
  pro: { productLimit: 8, maxAnnonceWeeks: 6 },
  business: { productLimit: 12, maxAnnonceWeeks: 8 }
};

export default function NewProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productLimits, setProductLimits] = useState({
    productLimit: 4, // Standard starter pakke
    usedProducts: 0,
    availableProducts: 4,
    maxAnnonceWeeks: 2
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Hent bruger
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        
        setUserId(user.id);
        
        // Hent brugerens pakke
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('package_type')
          .eq('user_id', user.id)
          .single();
          
        // Hvis ingen pakke findes, brug starter som standard
        const packageType = (subscriptionData?.package_type || 'starter') as PackageType;
        const limits = PACKAGE_LIMITS[packageType];
        
        // Hent antal brugte produkter
        const { count: usedProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (productsError) throw productsError;
        
        // Beregn produktgrænser
        const used = usedProducts || 0;
        setProductLimits({
          productLimit: limits.productLimit,
          usedProducts: used,
          availableProducts: limits.productLimit - used,
          maxAnnonceWeeks: limits.maxAnnonceWeeks
        });
        
        // Hent kategorier
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
      } catch (error: any) {
        console.error('Fejl ved indlæsning:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supabase, router]);

  if (loading) {
    return <div>Indlæser...</div>;
  }

  if (error) {
    return <div>Fejl: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg mb-6">
        <nav className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/dashboard" 
              className={cn(
                "px-3 py-2 rounded-md",
                pathname === "/dashboard" 
                  ? "bg-[#1AA49A] text-white font-medium" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Oversigt
            </Link>
            <Link 
              href="/dashboard/products" 
              className={cn(
                "px-3 py-2 rounded-md",
                pathname === "/dashboard/products" 
                  ? "bg-[#1AA49A] text-white font-medium" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Mine produkter
            </Link>
            <Link 
              href="/dashboard/create-product/new" 
              className={cn(
                "px-3 py-2 rounded-md",
                pathname === "/dashboard/create-product/new" 
                  ? "bg-[#1AA49A] text-white font-medium" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Opret produkt
            </Link>
            <Link 
              href="/dashboard/messages" 
              className={cn(
                "px-3 py-2 rounded-md",
                pathname === "/dashboard/messages" 
                  ? "bg-[#1AA49A] text-white font-medium" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Beskeder
            </Link>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/dashboard/extend-period" 
              className="px-4 py-2 bg-[#1AA49A] text-white rounded-md hover:bg-[#158F86] transition-colors"
            >
              Forlæng periode
            </Link>
            <Link 
              href="/dashboard/upgrade" 
              className="px-4 py-2 bg-[#D91B5C] text-white rounded-md hover:bg-[#C41852] transition-colors"
            >
              Køb mere plads
            </Link>
          </div>
        </nav>
      </div>

      {userId && (
        <ProductForm 
          userId={userId} 
          categories={categories} 
          productLimits={productLimits}
        />
      )}
    </div>
  );
} 