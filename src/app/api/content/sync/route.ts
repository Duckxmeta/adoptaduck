import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const SYNC_SECRET = process.env.SYNC_SECRET || 'adopt-a-duck-sync-token-2026';

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication Header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse payload JSON
    const body = await request.json();
    const { content_text, media_urls, source_platform, platform } = body;

    if (!content_text) {
      return NextResponse.json({ error: 'Missing content_text parameter' }, { status: 400 });
    }

    // Strict Hashtag Filter: Only sync updates that explicitly include #Adoptaduck
    if (!content_text.toLowerCase().includes('#adoptaduck')) {
      return NextResponse.json({
        skipped: true,
        message: 'Post skipped: Content does not contain required hashtag #Adoptaduck'
      }, { status: 200 });
    }

    // 3. Ensure authenticated context for Firestore SDK
    const { auth, firestore } = initializeFirebase();
    let authMethod = 'none';
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
        authMethod = 'anonymous';
      } catch (authErr: any) {
        console.warn('Anonymous auth sign-in warning:', authErr?.message || authErr);
        authMethod = `failed: ${authErr?.message || authErr}`;
      }
    } else {
      authMethod = 'existing';
    }

    // 4. Write cleanly into Firestore
    try {
      const docRef = await addDoc(collection(firestore, 'subscriber_posts'), {
        content_text: content_text,
        media_urls: Array.isArray(media_urls) ? media_urls : [],
        source_platform: source_platform || platform || 'X',
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        postId: docRef.id,
        authMethod,
        message: 'Subscriber update post synchronized successfully.'
      });
    } catch (dbErr: any) {
      console.error('Firestore addDoc error:', dbErr);
      return NextResponse.json({
        error: dbErr?.message || dbErr,
        code: dbErr?.code,
        authMethod
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Failed to sync subscriber post:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
