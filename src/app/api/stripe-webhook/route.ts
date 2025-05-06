import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') || '';
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // Metadata skal sendes med fra checkout-sessionen
    const meta = session.metadata || {};
    if (!meta.seller_id || !meta.buyer_id || !meta.product_id) {
      return NextResponse.json({ error: 'Mangler metadata for transaktion.' }, { status: 400 });
    }
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const commissionRate = meta.commission_rate ? parseFloat(meta.commission_rate) : 10.0;
    const commissionAmount = amount * (commissionRate / 100);
    const { error } = await supabase.from('transactions').insert({
      seller_id: meta.seller_id,
      buyer_id: meta.buyer_id,
      product_id: meta.product_id,
      amount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      status: 'pending',
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
