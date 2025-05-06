import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, description, price, ...rest } = await req.json();
  try {
    // 1. Opret produkt i Stripe
    const product = await stripe.products.create({ name, description });
    // 2. Opret pris i Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency: 'dkk',
      product: product.id,
    });
    // 3. Gem i din database
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
          ...rest,
        },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, productId: data[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
