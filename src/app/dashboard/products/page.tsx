'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/components/SupabaseProvider';
import DashboardHeader from '../components/DashboardHeader';
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

// Helper function to create a URL-friendly slug
const createSlug = (text: string) => {
  if (!text) return 'produkt';
  return text
    .toLowerCase()
    .replace(/[^\w\såæø]/g, '-') // Replace non-word chars with dash
    .replace(/\s+/g, '-')        // Replace spaces with dash
    .replace(/å/g, 'aa')         // Convert Nordic characters
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-+/, '')          // Trim dash from start
    .replace(/-+$/, '');         // Trim dash from end
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const justCreated = searchParams.get('created') === 'true';
  
  useEffect(() => {
    // Hent bruger-ID og session fra auth
    const getUserSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Fejl ved hentning af bruger:', error);
        setErrorMessage('Kunne ikke hente brugeroplysninger. Prøv at genindlæse siden.');
      }
    };
    
    getUserSession();
  }, [supabase]);
  
  useEffect(() => {
    // Kør kun fetchProducts når userId er sat
    if (!userId) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      setErrorMessage('');
      
      try {
        // Forenklet forespørgsel uden featured
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price, status, created_at, expires_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // For hvert produkt, hent dets billeder separat
        const productsWithImages = await Promise.all(
          data.map(async (product) => {
            // Hent billeder for dette produkt
            const { data: images, error: imagesError } = await supabase
              .from('product_images')
              .select('url, display_order')
              .eq('product_id', product.id)
              .order('display_order', { ascending: true });
            
            if (imagesError) {
              console.error(`Fejl ved hentning af billeder for produkt ${product.id}:`, imagesError);
              return { 
                ...product, 
                image_url: null, 
                category_name: '',
                featured: false // Tilføj default featured værdi
              };
            }
            
            // Tilføj første billedes URL til produktet eller null hvis ingen billeder
            return { 
              ...product, 
              image_url: images && images.length > 0 ? images[0].url : null,
              category_name: '',
              featured: false // Tilføj default featured værdi
            };
          })
        );
        
        setProducts(productsWithImages);
        console.log('Produkter med billeder:', productsWithImages);
      } catch (error: any) {
        console.error('Fejl ved hentning af produkter:', error);
        setProducts([]);
        setErrorMessage(`Der opstod en fejl ved hentning af produkter: ${error?.message || 'Ukendt fejl'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    
    if (justCreated) {
      setSuccessMessage('Dit produkt er blevet oprettet!');
    }
  }, [supabase, justCreated, userId]);
  
  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleFeatureProduct = async (productId: string) => {
    try {
      // Find produktet
      const product = products.find(p => p.id === productId);
      
      if (!product) return;
      
      // Skift featured status
      const { error } = await supabase
        .from('products')
        .update({ featured: !product.featured })
        .eq('id', productId);
        
      if (error) throw error;
      
      // Opdater produktlisten
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, featured: !p.featured } : p
      ));
      
      setSuccessMessage(`Produkt ${product.featured ? 'fjernet fra' : 'tilføjet til'} fremhævede produkter!`);
      
    } catch (error: any) {
      console.error('Fejl ved fremhævning af produkt:', error);
      setErrorMessage(`Der opstod en fejl ved fremhævning af produktet: ${error?.message || 'Ukendt fejl'}`);
    }
  };
  
  const handleDeleteProducts = async () => {
    if (!selectedProducts.length) return;
    
    if (!confirm(`Er du sikker på, at du vil slette ${selectedProducts.length} ${selectedProducts.length === 1 ? 'produkt' : 'produkter'}?`)) {
      return;
    }
    
    try {
      // Slet produkterne
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);
        
      if (error) throw error;
      
      // Opdater produktlisten
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      
      // Ryd valgte produkter
      setSelectedProducts([]);
      
      setSuccessMessage(`${selectedProducts.length} ${selectedProducts.length === 1 ? 'produkt' : 'produkter'} slettet!`);
      
    } catch (error: any) {
      console.error('Fejl ved sletning af produkter:', error);
      setErrorMessage(`Der opstod en fejl ved sletning af produkter: ${error?.message || 'Ukendt fejl'}`);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#1AA49A]/10 text-[#1AA49A]">Aktiv</span>;
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F08319]/10 text-[#F08319]">Afventer</span>;
      case 'sold':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#BC1964]/10 text-[#BC1964]">Solgt</span>;
      case 'expired':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Udløbet</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      
      <div className="mt-8 bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-[#1AA49A]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mine produkter</h1>
              <p className="text-gray-600 mt-1">
                {products.length === 0 ? 
                  'Du har endnu ikke oprettet nogen produkter.' : 
                  `Du har ${products.length} ${products.length === 1 ? 'produkt' : 'produkter'}.`}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/dashboard/create-product"
                className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Opret nyt produkt
              </Link>
            </div>
          </div>
        </div>
        
        <Toast 
          message={successMessage}
          variant="success"
          onClose={() => setSuccessMessage('')}
          autoClose={true}
          duration={5000}
        />
        
        <Toast 
          message={errorMessage}
          variant="error"
          onClose={() => setErrorMessage('')}
          autoClose={true}
          duration={5000}
        />
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 animate-pulse">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Indlæser produkter...</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Ingen produkter</h3>
              <p className="mt-1 text-sm text-gray-500">
                Du har ikke oprettet nogen produkter endnu. Kom i gang med at sælge ved at oprette dit første produkt.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/create-product"
                  className="bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-2 rounded-full font-medium transition-colors inline-flex items-center"
                >
                  Opret dit første produkt
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  {selectedProducts.length > 0 && (
                    <button
                      onClick={handleDeleteProducts}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                    >
                      Slet valgte ({selectedProducts.length})
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Tip: Klik på et produkt for at markere det
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-[#1AA49A] rounded cursor-pointer"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={() => {
                            if (selectedProducts.length === products.length) {
                              setSelectedProducts([]);
                            } else {
                              setSelectedProducts(products.map(p => p.id));
                            }
                          }}
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Produkt
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Kategori
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Pris
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Oprettet
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                        Handlinger
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <tr 
                        key={product.id} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100 ${selectedProducts.includes(product.id) ? 'bg-[#1AA49A]/10' : ''}`}
                        onClick={() => toggleSelectProduct(product.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#1AA49A] focus:ring-[#1AA49A] border-[#1AA49A] rounded cursor-pointer"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.title} 
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
                                  <PhotoIcon className="h-6 w-6 text-[#0F172A]" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[#0F172A]">
                                {product.title}
                              </div>
                              <div className="text-sm text-[#0F172A]/70">{product.category_name || 'Ingen kategori'}</div>
                              {product.featured && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Fremhævet
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#0F172A]">{product.category_name || 'Ingen kategori'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#0F172A]">{formatMoney(product.price)} kr</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(product.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#0F172A]">{formatRelativeDate(product.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <span className="flex justify-end gap-3">
                            <a 
                              href="#"
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFeatureProduct(product.id);
                              }}
                            >
                              Fremhæv
                            </a>
                            <Link
                              href={`/dashboard/products/${product.id}`}
                              className="text-[#1AA49A] hover:text-[#1AA49A]/80 mr-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Redigér
                            </Link>
                            <Link
                              href={product.id && product.id !== 'undefined' 
                                ? `/product/kategori/${createSlug(product.title || 'produkt')}-${product.id}` 
                                : '/product'}
                              className="text-[#BC1964] hover:text-[#BC1964]/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(`Navigering til produkt: ID=${product.id}, Titel=${product.title}, URL=/product/kategori/${createSlug(product.title || 'produkt')}-${product.id}`);
                              }}
                            >
                              Vis
                            </Link>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 