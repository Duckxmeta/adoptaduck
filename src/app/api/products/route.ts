import { NextResponse } from 'next/server';

/**
 * @fileOverview Final Merch Quick Store Controller.
 * Implements Strict Matching using 9-digit Sync Product IDs.
 * Tier 1: Staples
 * Tier 2: Seasonal (Summer)
 * Tier 3: Accessories
 * Tier 4: DECENTralized Merch
 * Tier 5: OG Merch Line
 */

const STAPLE_IDS = ['427494940', '390119961', '427491715'];
const SEASONAL_SUMMER_IDS = ['427490682', '427490526', '427490183'];
const ACCESSORY_IDS = ['427493867', '427493676', '427494347'];
const DECENTRALIZED_IDS = ['390254175', '390112271', '390110911'];
const OG_IDS = ['369430382', '369430416', '369548933', '369283718'];

const QUICK_STORE_BASE = 'https://justduckit-merch.printful.me/product/';

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: PRINTFUL_API_KEY missing');
    return NextResponse.json({ error: 'Sanctuary store mirror not configured' }, { status: 500 });
  }

  try {
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    
    // 1. Fetch ALL products from Printful
    const response = await fetch('https://api.printful.com/store/products', { headers });
    if (!response.ok) throw new Error(`Printful Error: ${response.statusText}`);

    const data = await response.json();
    const allProducts = data.result || [];

    // 2. Strict ID Filtering
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 3 && currentMonth <= 8; // April to Sept

    const stapleProducts = allProducts.filter((p: any) => STAPLE_IDS.includes(p.id.toString()));
    const seasonalProducts = isSummer ? allProducts.filter((p: any) => SEASONAL_SUMMER_IDS.includes(p.id.toString())) : [];
    const accessoryProducts = allProducts.filter((p: any) => ACCESSORY_IDS.includes(p.id.toString()));
    const decentralizedProducts = allProducts.filter((p: any) => DECENTRALIZED_IDS.includes(p.id.toString()));
    const ogProducts = allProducts.filter((p: any) => OG_IDS.includes(p.id.toString()));

    // 3. Hydrate strictly matched products
    const hydrate = async (p: any, tier: number) => {
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, { headers });
        if (!detailRes.ok) return null;

        const detailData = await detailRes.json();
        const syncProduct = detailData.result?.sync_product || {};
        const variants = detailData.result?.sync_variants || [];
        
        const prices = variants
          .map((v: any) => parseFloat(v.retail_price))
          .filter((price: number) => !isNaN(price));

        if (prices.length === 0) return null;

        const thumb = p.thumbnail_url || (variants[0]?.files?.find((f: any) => f.type === 'preview')?.thumbnail_url) || variants[0]?.files?.[0]?.thumbnail_url;

        return {
          id: p.id,
          name: p.name,
          thumbnailUrl: thumb,
          redirectUrl: `${QUICK_STORE_BASE}${p.id}`,
          minPrice: Math.min(...prices),
          tier
        };
      } catch (e) {
        return null;
      }
    };

    const [staples, seasonal, accessories, decentralized, og] = await Promise.all([
      Promise.all(stapleProducts.map(p => hydrate(p, 1))),
      Promise.all(seasonalProducts.map(p => hydrate(p, 2))),
      Promise.all(accessoryProducts.map(p => hydrate(p, 3))),
      Promise.all(decentralizedProducts.map(p => hydrate(p, 4))),
      Promise.all(ogProducts.map(p => hydrate(p, 5)))
    ]);

    const results = [
      ...staples,
      ...seasonal,
      ...accessories,
      ...decentralized,
      ...og
    ].filter(Boolean);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('STOREFRONT SYNC ERROR:', error);
    return NextResponse.json({ error: 'Failed to synchronize storefront' }, { status: 500 });
  }
}
