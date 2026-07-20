require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');
const config = require('../firebase-applet-config.json');

const firebaseConfig = {
  ...config,
  storageBucket: "studio-7482167027-804c1.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Loads X_COOKIES from .env.local and returns formatted Cookie header string.
 */
function getXCookieHeader() {
  const rawCookies = process.env.X_COOKIES;
  if (!rawCookies) {
    console.warn('[X Sync Loader] Warning: X_COOKIES environment variable not found in .env.local.');
    return '';
  }

  try {
    const parsed = JSON.parse(rawCookies);
    if (Array.isArray(parsed)) {
      return parsed.map(c => `${c.name}=${c.value}`).join('; ');
    }
  } catch (err) {
    console.error('[X Sync Loader] Error parsing X_COOKIES JSON:', err.message);
  }
  return '';
}

/**
 * Node.js Internal Cron Job / Server Sync Script.
 * Fetches subscriber posts using X_COOKIES session context and writes to Firestore.
 */
async function syncPostPayload(payload) {
  const { content_text, platform, source_platform, media_urls } = payload;
  
  if (!content_text) {
    throw new Error("Missing content_text parameter");
  }

  // Strict Hashtag Filter: Only pull/sync posts containing #Adoptaduck
  if (!content_text.toLowerCase().includes('#adoptaduck')) {
    console.log('[X Sync Cron] Post skipped: Does not contain required hashtag #Adoptaduck.');
    return null;
  }

  const cookieHeader = getXCookieHeader();
  if (cookieHeader) {
    console.log('[X Sync Cron] Authenticated X session cookies loaded successfully.');
  }

  // Strict Deduplication Check: Skip write if post with exact content_text already exists
  try {
    const postsRef = collection(db, 'subscriber_posts');
    const dupeQuery = query(postsRef, where('content_text', '==', content_text));
    const dupeSnap = await getDocs(dupeQuery);
    if (!dupeSnap.empty) {
      console.log(`[X Sync Cron] Duplicate post detected (ID: ${dupeSnap.docs[0].id}). Skipping write.`);
      return dupeSnap.docs[0].id;
    }
  } catch (checkErr) {
    console.warn('[X Sync Cron] Deduplication check warning:', checkErr.message);
  }

  const platformName = source_platform || platform || 'X';
  const documentData = {
    content_text: content_text,
    source_platform: platformName,
    media_urls: Array.isArray(media_urls) ? media_urls : [],
    timestamp: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'subscriber_posts'), documentData);
  console.log(`[X Sync Cron] Post synced successfully to subscriber_posts! Doc ID: ${docRef.id}`);

  try {
    await addDoc(collection(db, 'bulletin'), {
      title: `X Update: #${platformName}`,
      content: content_text,
      imageUrl: Array.isArray(media_urls) && media_urls.length > 0 ? media_urls[0] : null,
      timestamp: new Date().toISOString(),
      source: 'X'
    });
    console.log(`[X Sync Cron] Post mirrored successfully to bulletin collection for /admin portal.`);
  } catch (bErr) {
    console.warn('[X Sync Cron] Mirror write to bulletin collection warning:', bErr.message);
  }

  return docRef.id;
}

// Runnable test execution
if (require.main === module) {
  const samplePayload = {
    content_text: "🦆 Exclusive Sanctuary Update (#Adoptaduck): Our duck flock just enjoyed a fresh delivery of watermelons and warm evening pond swims! Thank you Guardians for supporting sanctuary operations.",
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

module.exports = { syncPostPayload, getXCookieHeader };
