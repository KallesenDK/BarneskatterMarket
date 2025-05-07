import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Kør denne route én gang for at migrere eksisterende produkter til Stripe
export async function POST(req: NextRequest) {
  // Hent alle produkter uden stripe_product_id
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .is('stripe_product_id', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const migrated: any[] = [];
  const failed: any[] = [];

  for (const product of products || []) {
    try {
      // Opret produkt i Stripe
      const stripeProduct = await stripe.products.create({
        name: product.title || product.name,
        description: product.description || '',
      });
      // Opret pris i Stripe
      const stripePrice = await stripe.prices.create({
        unit_amount: Math.round((product.price || 0) * 100),
        currency: 'dkk',
        product: stripeProduct.id,
      });
      // Opdater produkt i Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        })
        .eq('id', product.id);
      if (updateError) throw updateError;
      migrated.push({ id: product.id, stripe_product_id: stripeProduct.id });
    } catch (err: any) {
      failed.push({ id: product.id, error: err.message });
    }
  }

  return NextResponse.json({ migrated, failed });
}
