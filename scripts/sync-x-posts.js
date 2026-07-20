const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const firebaseConfig = {
  ...config,
  storageBucket: "studio-7482167027-804c1.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Node.js Internal Cron Job / Server Sync Script.
 * Fetches or parses timeline posts and syncs them to subscriber_posts collection.
 * Payload format: { content_text: "...", platform: "X", media_urls: [...] }
 */
async function syncPostPayload(payload) {
  const { content_text, platform, source_platform, media_urls } = payload;
  
  if (!content_text) {
    throw new Error("Missing content_text parameter");
  }

  const documentData = {
    content_text: content_text,
    source_platform: source_platform || platform || 'X',
    media_urls: Array.isArray(media_urls) ? media_urls : [],
    timestamp: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'subscriber_posts'), documentData);
  console.log(`[X Sync Cron] Post synced successfully to Firestore! Doc ID: ${docRef.id}`);
  return docRef.id;
}

// Runnable test execution
if (require.main === module) {
  const samplePayload = {
    content_text: "🦆 Exclusive Sanctuary Update: Our duck flock just enjoyed a fresh delivery of watermelons and warm evening pond swims! Thank you Guardians for supporting sanctuary operations.",
    platform: "X"
  };

  syncPostPayload(samplePayload)
    .then((id) => {
      console.log(`[X Sync Cron] Test execution verified! Processed ID: ${id}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[X Sync Cron] Error running sync:", err);
      process.exit(1);
    });
}

module.exports = { syncPostPayload };
