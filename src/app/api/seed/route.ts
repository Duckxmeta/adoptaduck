import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export async function GET() {
  try {
    const { auth, firestore } = initializeFirebase();
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (aErr) {}
    }

    // Seed promo code DUCKSONXSUBS
    const promoRef = doc(firestore, 'promo_codes', 'DUCKSONXSUBS');
    await setDoc(promoRef, {
      code: 'DucksonxSUBS',
      targetRole: 'guardian',
      durationDays: 365,
      isActive: true,
      usageCount: 0,
      type: 'bypass_upgrade',
      createdAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Promo code DucksonxSUBS seeded successfully!"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
