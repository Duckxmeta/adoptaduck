import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

/**
 * @fileOverview Final Production Checkout Controller.
 * Handles Price API ID mapping and dynamic session mode selection.
 * Guardian Tiers: Subscription Mode | Splash Tiers: Payment Mode
 */

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json();

    if (!stripeSecretKey) {
      throw new Error('Stripe API key is missing');
    }

    // Dynamic Mode Selection based on validated Price IDs
    const subscriptionPrices = [
      process.env.STRIPE_PRICE_GUARDIAN_MONTHLY,
      process.env.STRIPE_PRICE_GUARDIAN_YEARLY
    ];

    const isSubscription = subscriptionPrices.includes(priceId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancel`,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        type: 'Sanctuary Support',
        userId: userId || 'anonymous',
        source: 'Decent Ducks Production'
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
