import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customerInfo, successUrl, cancelUrl } = await req.json();
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Kurven er tom.' }, { status: 400 });
    }

    // Byg line_items array til Stripe Checkout
    const line_items = cartItems.map((item: any) => {
      if (!item.stripe_price_id) throw new Error('Produkt mangler Stripe price_id');
      return {
        price: item.stripe_price_id,
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerInfo?.email,
      metadata: {
        user_id: customerInfo?.user_id || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
