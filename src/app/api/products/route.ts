import { NextResponse } from 'next/server';

/**
 * @fileOverview Final Merch Lockdown Controller.
 * Implements Strict Matching using 9-digit Sync Product IDs.
 * Tier 1: Staples (Core Brand)
 * Tier 2: Seasonal (Summer Selection - April-Sept)
 * Tier 3: Accessories (Sanctuary Gear)
 */

const STAPLE_IDS = ['390252688', '426252489', '426261731'];
const SEASONAL_SUMMER_IDS = ['426819811', '426817550', '426817886'];
const ACCESSORY_IDS = ['426256061', '426257115', '426254324', '426258041'];

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

    // 2. Strict ID Filtering - No Failsafes, only provided 9-digit IDs
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 3 && currentMonth <= 8; // April to Sept

    const stapleProducts = allProducts.filter((p: any) => STAPLE_IDS.includes(p.id.toString()));
    const seasonalProducts = isSummer ? allProducts.filter((p: any) => SEASONAL_SUMMER_IDS.includes(p.id.toString())) : [];
    const accessoryProducts = allProducts.filter((p: any) => ACCESSORY_IDS.includes(p.id.toString()));

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
          redirectUrl: syncProduct.external_url || `https://decent-ducks.printful.me/product/${p.id}`,
          minPrice: Math.min(...prices),
          tier
        };
      } catch (e) {
        return null;
      }
    };

    const [staples, seasonal, accessories] = await Promise.all([
      Promise.all(stapleProducts.map(p => hydrate(p, 1))),
      Promise.all(seasonalProducts.map(p => hydrate(p, 2))),
      Promise.all(accessoryProducts.map(p => hydrate(p, 3)))
    ]);

    const results = [
      ...staples,
      ...seasonal,
      ...accessories
    ].filter(Boolean);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('STOREFRONT SYNC ERROR:', error);
    return NextResponse.json({ error: 'Failed to synchronize storefront' }, { status: 500 });
  }
}
