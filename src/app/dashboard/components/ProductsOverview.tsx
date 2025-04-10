'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/components/SupabaseProvider'
import { formatDate, formatRelativeDate } from '@/lib/utils'

type Product = {
  id: string
  title: string
  price: number
  discount_price: number | null
  discount_active: boolean
  image_url: string | null
  category: string
  created_at: string
  expires_at: string
}

type ProductLimits = {
  productLimit: number
  usedProducts: number
  availableProducts: number
}

interface ProductsOverviewProps {
  userId: string
  productLimits?: ProductLimits
}

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

function ProductsLoading() {
  return (
    <div className="p-6 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div className="h-32 bg-gray-200 rounded max-w-md mx-auto"></div>
      </div>
    </div>
  )
}

export default function ProductsOverview({ userId, productLimits }: ProductsOverviewProps) {
  const { supabase } = useSupabase()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        
        // Hent produkter
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }

        // For hvert produkt, hent dets billeder
        const productsWithImages = await Promise.all(
          (data || []).map(async (product) => {
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
                image_url: null
              };
            }
            
            // Tilføj første billedes URL til produktet eller null hvis ingen billeder
            return { 
              ...product, 
              image_url: images && images.length > 0 ? images[0].url : null
            };
          })
        );
        
        setProducts(productsWithImages)
      } catch (error: any) {
        console.error('Fejl ved hentning af produkter:', error)
        setError('Kunne ikke hente produkter. Prøv igen senere.')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchProducts()
    }
  }, [userId, supabase])
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-[#1AA49A]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Dine produkter til salg ({products.length} af {productLimits?.productLimit || 4})
            </h2>
          </div>
        </div>
        <ProductsLoading />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-[#1AA49A]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Dine produkter til salg ({products.length} af {productLimits?.productLimit || 4})
            </h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Prøv igen
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-[#1AA49A]">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Dine produkter til salg ({products.length} af {productLimits?.productLimit || 4})
          </h2>
          <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Se alle
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {products.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Du har ingen produkter til salg.</p>
            <Link href="/dashboard/create-product" className="mt-4 inline-block bg-[#1AA49A] hover:bg-[#1AA49A]/90 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Opret dit første produkt
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                  Produkt
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                  Pris
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                  Oprettet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                  Udløber
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#0F172A] uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Handlinger</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.slice(0, 5).map((product, index) => {
                const isExpired = new Date(product.expires_at) < new Date();
                const isOnSale = product.discount_active;
                
                return (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={product.image_url} 
                              alt={product.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.jpg';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#0F172A]">{product.title}</div>
                          <div className="text-sm text-[#0F172A]/70">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isOnSale && product.discount_price ? (
                        <div>
                          <span className="text-sm text-[#0F172A] font-medium">{product.discount_price} kr.</span>
                          <span className="text-xs text-[#0F172A]/70 line-through ml-2">{product.price} kr.</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#0F172A]">{product.price} kr.</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A]/70">
                      {formatRelativeDate(product.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#0F172A]/70">
                      {formatDate(new Date(product.expires_at))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Udløbet
                        </span>
                      ) : isOnSale ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#F08319]/10 text-[#F08319]">
                          På tilbud
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#1AA49A]/10 text-[#1AA49A]">
                          Aktiv
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/products/${product.id}`} className="text-[#1AA49A] hover:text-[#1AA49A]/80 mr-4">
                        Redigér
                      </Link>
                      <Link 
                        href={product.id && product.id !== 'undefined' 
                          ? `/product/kategori/${createSlug(product.title)}-${product.id}` 
                          : '/product'}
                        className="text-[#BC1964] hover:text-[#BC1964]/80"
                      >
                        Vis
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {products.length > 5 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Link href="/dashboard/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Vis alle {products.length} produkter
          </Link>
        </div>
      )}
    </div>
  )
} 