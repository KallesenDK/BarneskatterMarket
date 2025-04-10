import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Deaktiver caching for denne API-rute
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductImage {
  url: string;
  display_order: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  postal_code: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  user_id: string;
  images?: string[];
  user?: User;
}

export async function GET() {
  try {
    console.log('API: Henter produkter fra databasen...');
    const supabase = getSupabaseClient();
    
    // 1. Hent produkter fra Supabase med brugeroplysninger
    const { data: productsData, error } = await supabase
      .from('products')
      .select(`
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          address,
          postal_code
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase fejl ved hentning af produkter:', error);
      return NextResponse.json({ message: 'Fejl ved hentning af produkter' }, { status: 500 });
    }

    const products = productsData as unknown as Product[];
    
    console.log(`API: Fandt ${products.length} produkter, henter nu billeder...`);
    
    // 2. For hvert produkt, hent dets billeder fra product_images tabellen
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        // Hent billeder for produktet
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select('url, display_order')
          .eq('product_id', product.id)
          .order('display_order', { ascending: true });
        
        if (imageError) {
          console.error(`Fejl ved hentning af billeder for produkt ${product.id}:`, imageError);
          // Fortsæt med produkt uden billeder
          return {
            ...product,
            images: product.images || [] // Bevar eventuelle eksisterende billeder i produktet
          };
        }
        
        // Tilføj billeder til produktet som et array af URLs
        const imageUrls = (imageData as ProductImage[])?.map(img => img.url) || [];
        
        // Behold eventuelle eksisterende billeder og tilføj dem fra product_images
        const allImages = [
          ...(product.images && Array.isArray(product.images) ? product.images : []),
          ...imageUrls
        ];
        
        // Fjern dubletter
        const uniqueImages = [...new Set(allImages)];
        
        return {
          ...product,
          images: uniqueImages
        };
      })
    );
    
    console.log('API: Returnerer produkter med billeder');
    
    // Tilføj headers for at sikre ingen caching
    return new NextResponse(JSON.stringify(productsWithImages), {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Uventet fejl:', error);
    return NextResponse.json({ message: 'Der opstod en fejl' }, { status: 500 });
  }
} 