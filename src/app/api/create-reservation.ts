import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customerInfo } = await req.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Kurven er tom.' }, { status: 400 });
    }

    // For hver produkt i kurven
    for (const item of cartItems) {
      // 1. Opret ordre
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          product_id: item.id,
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          mobile: customerInfo.mobile,
          street: customerInfo.street,
          street_number: customerInfo.streetNumber,
          postal_code: customerInfo.postalCode,
          city: customerInfo.city,
          phone: customerInfo.phone,
          email: customerInfo.email,
          price: item.price, // træk prisen fra produktet
          pickup_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        });
      if (orderError) throw new Error(orderError.message);

      // 2. Sæt produkt som reserveret
      const { error: prodError } = await supabase
        .from('products')
        .update({ is_reserved: true })
        .eq('id', item.id);
      if (prodError) throw new Error(prodError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
