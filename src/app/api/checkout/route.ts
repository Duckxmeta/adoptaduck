import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    })
  : null;

// Production Price ID mapping for mode detection
const SUBSCRIPTION_PRICE_IDS = [
  process.env.STRIPE_PRICE_GUARDIAN_MONTHLY || 'price_1THAffGyzCRtb3Hx7RHfIdqC',
  process.env.STRIPE_PRICE_GUARDIAN_YEARLY || 'price_1THAccGyzCRtb3HxwQ1njXlS'
];

const SPLASH_PRODUCT_ID = 'prod_UFg401BhNEqMsY';
const CUSTOM_PRICE_ID = process.env.STRIPE_PRICE_SPLASH_CUSTOM || 'price_1THAmlGyzCRtb3HxiD9YcrR5';

/**
 * @fileOverview Final Production Checkout Controller.
 * Resolves SyntaxError by guaranteeing JSON responses.
 * Maps 6 tiers to Subscription or Payment modes dynamically.
 * Supports Custom Amount donations via price_data override.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { priceId, userId, userEmail, amount } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const stripeInstance = stripe;
    if (!stripeInstance || !stripeSecretKey) {
      console.error('Stripe Secret Key missing in environment');
      return NextResponse.json({ error: 'Sanctuary financial engine misconfigured' }, { status: 500 });
    }

    // Dynamic Mode Selection: Guardian Tiers = Subscription | Splash Tiers = Payment
    const isSubscription = SUBSCRIPTION_PRICE_IDS.includes(priceId);
    const isCustom = priceId === CUSTOM_PRICE_ID;

    // Build line items dynamically to support custom amounts
    const line_items = isCustom && amount 
      ? [{
          price_data: {
            currency: 'usd',
            product: SPLASH_PRODUCT_ID,
            unit_amount: Math.round(parseFloat(amount) * 100), // Convert to cents
          },
          quantity: 1,
        }]
      : [{
          price: priceId,
          quantity: 1,
        }];

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}&type=${isSubscription ? 'guardian' : 'supporter'}`,
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
    console.error('Stripe Checkout Critical Failure:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      status: 'failed'
    }, { status: 500 });
  }
}
