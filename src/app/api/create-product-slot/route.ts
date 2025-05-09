import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('API HIT: create-product-slot');
  const { name, description, price, slot_count, ...rest } = await req.json();
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
    // 3. Gem i Supabase
    const { data, error } = await supabase
      .from('product_slots')
      .insert([
        {
          name,
          description,
          price,
          slot_count,
          stripe_product_id: product.id,
          stripe_price_id: stripePrice.id,
          ...rest,
        },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, slotId: data[0].id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
