const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, increment } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const firebaseConfig = {
  ...config,
  storageBucket: "studio-7482167027-804c1.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

async function seed() {
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
    
    const docRef = await addDoc(collection(db, 'donations'), payload);
    console.log(`Recorded donation ${docRef.id} for $${donation.amount}`);
    totalUSD += donation.amount;
  }
  
  console.log(`Incrementing transparency totals document...`);
  const totalsRef = doc(db, 'transparency', 'totals');
  await setDoc(totalsRef, {
    total_donations_count: increment(legacyDonations.length),
    total_usd_value_received: increment(totalUSD)
  }, { merge: true });
  
  console.log("Seeding completed successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
