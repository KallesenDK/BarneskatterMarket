import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Deaktiver caching for denne API-rute
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!supabase) {
      throw new Error('Supabase klient er ikke initialiseret');
    }

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
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 2. Transformer data
    const products = productsData.map(product => ({
      ...product,
      user: product.user ? {
        id: product.user.id,
        firstName: product.user.first_name,
        lastName: product.user.last_name,
        address: product.user.address,
        postalCode: product.user.postal_code
      } : null
    }));

    // 3. Returner data
    return NextResponse.json(products);
  } catch (error) {
    console.error('Fejl ved hentning af produkter:', error);
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af produkter' },
      { status: 500 }
    );
  }
} 