import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

/**
 * @fileOverview Stripe Checkout Session Controller.
 * Handles the creation of payment and subscription sessions for sanctuary support.
 */

export async function POST(request: Request) {
  try {
    const { priceId, userId, userEmail } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe API key is missing');
    }

    // Mapping logic for Guardian vs. Splash
    const isGuardian = priceId === 'prod_UFfyopJ1UUtWvC';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isGuardian ? 'subscription' : 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancel`,
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        type: 'Sanctuary Support',
        userId: userId || 'anonymous',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
