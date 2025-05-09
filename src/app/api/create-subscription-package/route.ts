import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('API HIT: create-subscription-package');
  const { name, description, price, duration_weeks, product_limit, max_quantity, ...rest } = await req.json();
  try {
    // 1. Opret produkt i Stripe
    let product, stripePrice;
    try {
      product = await stripe.products.create({ name, description });
      console.log('Stripe product:', product);
    } catch (err: any) {
      console.error('Stripe product error:', err);
      return NextResponse.json({ error: 'Fejl ved oprettelse af Stripe produkt', details: err.message }, { status: 500 });
    }
    try {
      stripePrice = await stripe.prices.create({
        unit_amount: Math.round(price * 100),
        currency: 'dkk',
        product: product.id,
      });
      console.log('Stripe price:', stripePrice);
    } catch (err: any) {
      console.error('Stripe price error:', err);
      return NextResponse.json({ error: 'Fejl ved oprettelse af Stripe pris', details: err.message }, { status: 500 });
    }
    // 2. Tjek limit hvis nødvendigt
    if (typeof max_quantity === 'number' && max_quantity > 0) {
      const { data: existing } = await supabase
        .from('subscription_packages')
        .select('id, sold_quantity, max_quantity')
        .eq('name', name)
        .maybeSingle();
      if (existing && typeof existing.sold_quantity === 'number' && typeof existing.max_quantity === 'number') {
        if (existing.sold_quantity >= existing.max_quantity) {
          return NextResponse.json({ error: 'Denne pakke er udsolgt.' }, { status: 400 });
        }
      }
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
          max_quantity: typeof max_quantity === 'number' ? max_quantity : null,
          sold_quantity: 0,
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
