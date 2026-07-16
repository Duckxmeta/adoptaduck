import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/firebase/init';
import { doc, updateDoc, serverTimestamp, collection, addDoc, setDoc, increment } from 'firebase/firestore';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * @fileOverview Stripe Webhook Handler.
 * Processes checkout completion events to provision member access and log donations.
 */

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  const stripeInstance = stripe;
  if (!stripeInstance || !stripeSecretKey || !endpointSecret) {
    console.error('Stripe credentials missing in webhook');
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    const { firestore } = initializeFirebase();

    // Provision Guardian Status ONLY if session mode is subscription
    if (userId && userId !== 'anonymous' && session.mode === 'subscription') {
      try {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, {
          role: 'guardian',
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('Failed to update user status:', e);
      }
    }

    // Log the donation for 501(c)(3) records and increment aggregates
    try {
      await addDoc(collection(firestore, 'donations'), {
        amount: amount,
        designation: session.mode === 'subscription' ? 'Guardian Subscription' : 'One-Time Support',
        timestamp: new Date().toISOString(),
        donorDisplayName: session.customer_details?.name || 'Sanctuary Supporter',
        uid: userId && userId !== 'anonymous' ? userId : null,
        metadata: 'Sanctuary Support'
      });

      const totalsRef = doc(firestore, 'transparency', 'totals');
      await setDoc(totalsRef, {
        total_donations_count: increment(1),
        total_usd_value_received: increment(amount)
      }, { merge: true });
    } catch (e) {
      console.error('Failed to log donation or update aggregates:', e);
    }
  }

  return NextResponse.json({ received: true });
}
