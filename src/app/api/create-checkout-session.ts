import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: Udskift med dynamisk data fra body/cart
    const line_items = [
      {
        price: body.priceId, // F.eks. 'price_12345'
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${body.successUrl || 'https://your-domain.dk/success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancelUrl || 'https://your-domain.dk/cancel',
      customer_email: body.email,
      metadata: {
        ...(body.metadata || {}),
        subscription_package_id: body.packageId || '',
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
