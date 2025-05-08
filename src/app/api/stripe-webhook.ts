import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Håndter kun successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // Find pakken via metadata eller line_items
    // Her antages at subscription_package_id er i metadata eller line_items
    const packageId = session.metadata?.subscription_package_id;
    if (packageId) {
      // Hent pakken og tjek limit
      const { data: pkg, error } = await supabase
        .from('subscription_packages')
        .select('id, sold_quantity, max_quantity')
        .eq('id', packageId)
        .maybeSingle();
      if (!error && pkg && typeof pkg.max_quantity === 'number' && pkg.max_quantity > 0) {
        if (pkg.sold_quantity < pkg.max_quantity) {
          await supabase
            .from('subscription_packages')
            .update({ sold_quantity: pkg.sold_quantity + 1 })
            .eq('id', packageId);
        }
      }
    }
  }
  return NextResponse.json({ received: true });
}
