import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc } from 'firebase/firestore';

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

    // 3. Write cleanly into Firestore
    const { firestore } = initializeFirebase();
    const docRef = await addDoc(collection(firestore, 'subscriber_posts'), {
      content_text: content_text,
      media_urls: Array.isArray(media_urls) ? media_urls : [],
      source_platform: source_platform || platform || 'X',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      postId: docRef.id,
      message: 'Subscriber update post synchronized successfully.'
    });
  } catch (err: any) {
    console.error('Failed to sync subscriber post:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
