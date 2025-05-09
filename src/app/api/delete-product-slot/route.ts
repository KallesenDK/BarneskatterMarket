import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Slet slot og tilhørende Stripe produkt/price (deaktiver)
export async function DELETE(req: NextRequest) {
  try {
    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ error: 'slotId mangler' }, { status: 400 });
    }

    // Find slot i Supabase for at få Stripe id'er
    const { data: slot, error: fetchError } = await supabase
      .from('product_slots')
      .select('id, stripe_product_id, stripe_price_id')
      .eq('id', slotId)
      .single();
    if (fetchError || !slot) {
      return NextResponse.json({ error: 'Slot ikke fundet' }, { status: 404 });
    }

    // Deaktiver Stripe produkt og price
    let stripeError = null;
    try {
      if (slot.stripe_price_id) {
        await stripe.prices.update(slot.stripe_price_id, { active: false });
      }
      if (slot.stripe_product_id) {
        await stripe.products.update(slot.stripe_product_id, { active: false });
      }
    } catch (err: any) {
      stripeError = err.message || 'Stripe fejl';
    }

    // Slet slot fra Supabase
    const { error: deleteError } = await supabase
      .from('product_slots')
      .delete()
      .eq('id', slotId);
    if (deleteError) {
      return NextResponse.json({ error: 'Fejl ved sletning i Supabase', details: deleteError.message }, { status: 500 });
    }

    if (stripeError) {
      // Sletning lykkedes i Supabase, men fejl i Stripe
      return NextResponse.json({ warning: 'Slot slettet, men fejl i Stripe', stripeError }, { status: 200 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
