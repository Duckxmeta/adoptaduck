import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, doc, setDoc, increment } from 'firebase/firestore';

const legacyDonations = [
  // Fiat
  { amount: 100, designation: "Legacy Support", allocation: "General Operations", isAnonymous: true },
  { amount: 75, designation: "Legacy Support", allocation: "General Operations", isAnonymous: true },
  { amount: 50, designation: "Legacy Support", allocation: "General Operations", isAnonymous: true },
  { amount: 40, designation: "Legacy Support", allocation: "General Operations", isAnonymous: true },
  { amount: 1, designation: "Legacy Support", allocation: "General Operations", isAnonymous: true },
  // SOL (converted to USD using our checkout SOL conversion factor of $150/SOL)
  { amount: 75, designation: "Legacy SOL Support", allocation: "General Operations", isAnonymous: true }, // 0.5 SOL
  { amount: 75, designation: "Legacy SOL Support", allocation: "General Operations", isAnonymous: true }, // 0.5 SOL
  { amount: 7.5, designation: "Legacy SOL Support", allocation: "General Operations", isAnonymous: true } // 0.05 SOL
];

export async function GET() {
  try {
    const { firestore } = initializeFirebase();
    console.log("Seeding legacy donation records...");
    let totalUSD = 0;
    
    for (const donation of legacyDonations) {
      const payload = {
        ...donation,
        timestamp: new Date().toISOString(),
        donorDisplayName: "Anonymous",
        uid: null,
        metadata: "Legacy Backpopulation"
      };
      
      await addDoc(collection(firestore, 'donations'), payload);
      totalUSD += donation.amount;
    }
    
    const totalsRef = doc(firestore, 'transparency', 'totals');
    await setDoc(totalsRef, {
      total_donations_count: increment(legacyDonations.length),
      total_usd_value_received: increment(totalUSD)
    }, { merge: true });
    
    return NextResponse.json({ success: true, message: "Legacy donations seeded successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
