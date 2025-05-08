import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'FOUND' : 'MISSING');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { name, description, price, duration_weeks, product_limit, ...rest } = await req.json();
  try {
    // 1. Opret produkt i Stripe
    let product, stripePrice;
    try {
      product = await stripe.products.create({ name, description });
      console.log('Stripe product created:', product.id);
    } catch (err) {
      console.error('Fejl ved oprettelse af Stripe produkt:', err);
      throw err;
    }
    try {
      stripePrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100),
        currency: 'dkk',
        product: product.id,
      });
      console.log('Stripe price created:', stripePrice.id);
    } catch (err) {
      console.error('Fejl ved oprettelse af Stripe pris:', err);
      throw err;
    }
    // 3. Gem i Supabase
    const { data, error } = await supabase
      .from('subscription_packages')
      .insert([
        {
          name,
          description,
          price,
          duration_weeks,
          product_limit,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
          ...rest,
        },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, packageId: data[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
