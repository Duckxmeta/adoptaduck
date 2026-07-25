import { NextResponse } from 'next/server';

const SYNC_SECRET = process.env.SYNC_SECRET || 'adopt-a-duck-sync-token-2026';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || new URL(request.url).searchParams.get('token');
    if (!authHeader || authHeader !== SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch access token from Google Cloud Metadata Server
    let token = '';
    try {
      const res = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
        headers: { 'Metadata-Flavor': 'Google' }
      });
      if (res.ok) {
        const data = await res.json();
        token = data.access_token;
        console.log('Successfully acquired metadata service token.');
      }
    } catch (e: any) {
      console.warn('Metadata token retrieval warning:', e.message);
    }

    if (!token) {
      return NextResponse.json({ error: 'Could not fetch cloud metadata authentication token.' }, { status: 500 });
    }

    const projectId = 'studio-7482167027-804c1';
    const baseRestUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

    // 2. Fetch all documents in subscriber_posts
    const postsRes = await fetch(`${baseRestUrl}/subscriber_posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let deletedCount = 0;
    if (postsRes.ok) {
      const data = await postsRes.json();
      const docs = data.documents || [];
      for (const doc of docs) {
        const docName = doc.name;
        const delRes = await fetch(`https://firestore.googleapis.com/v1/${docName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (delRes.ok) deletedCount++;
      }
    }

    // 3. Fetch and delete all documents in bulletin
    const bulletinRes = await fetch(`${baseRestUrl}/bulletin`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let deletedBulletins = 0;
    if (bulletinRes.ok) {
      const data = await bulletinRes.json();
      const docs = data.documents || [];
      for (const doc of docs) {
        const docName = doc.name;
        const delRes = await fetch(`https://firestore.googleapis.com/v1/${docName}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (delRes.ok) deletedBulletins++;
      }
    }

    // 4. Create single clean subscriber_post doc
    const cleanText = "Our duck flock just enjoyed a fresh delivery of watermelons and warm evening pond swims! Thank you Guardians for supporting sanctuary operations.";
    const writePostRes = await fetch(`${baseRestUrl}/subscriber_posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          content_text: { stringValue: cleanText },
          source_platform: { stringValue: 'X' },
          media_urls: { arrayValue: { values: [] } },
          timestamp: { stringValue: new Date().toISOString() }
        }
      })
    });

    // 5. Create single clean bulletin doc
    const writeBulletinRes = await fetch(`${baseRestUrl}/bulletin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          title: { stringValue: 'Sanctuary Update' },
          content: { stringValue: cleanText },
          imageUrl: { nullValue: null },
          timestamp: { stringValue: new Date().toISOString() },
          source: { stringValue: 'X' }
        }
      })
    });

    return NextResponse.json({
      success: true,
      deletedPosts: deletedCount,
      deletedBulletins: deletedBulletins,
      createdPostOk: writePostRes.ok,
      createdBulletinOk: writeBulletinRes.ok,
      message: 'Purged fluff records and seeded single clean sanctuary update entry.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
