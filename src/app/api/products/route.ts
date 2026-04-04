import { NextResponse } from 'next/server';

/**
 * @fileOverview Curated Merch API Controller with Hard Restoration, Debug, and Failsafe.
 * Synchronizes specific Printful IDs into Tiered Categories.
 * Tier 1: Staples (Always ON)
 * Tier 2: Seasonal (Summer: April-Sept)
 * Tier 3: Sanctuary Gear (Accessories)
 */

const STAPLE_IDS = ['68a540b74ab376', '69cbfd8a5d8938', '69cc0bf0eb8546'];
const SEASONAL_SUMMER_IDS = ['69d140ea45fe28', '69d13cef0d5c46', '69d13d58b1b314'];
const ACCESSORY_IDS = ['69cc02a0a31cc9', '69cc0475957615', '69cc004ee58d81', '69cc05e38a0234'];

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: PRINTFUL_API_KEY missing');
    return NextResponse.json({ error: 'Sanctuary store mirror not configured' }, { status: 500 });
  }

  try {
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    
    // 1. Fetch ALL products from Printful first
    const response = await fetch('https://api.printful.com/store/products', { headers });
    if (!response.ok) throw new Error(`Printful Error: ${response.statusText}`);

    const data = await response.json();
    const allProducts = data.result || [];

    // DEBUG: Log response details to check exact ID formats (ID vs External ID)
    console.log('--- PRINTFUL API DEBUG LOG ---');
    console.log(`Total Products Found: ${allProducts.length}`);
    if (allProducts.length > 0) {
      console.log('First 3 Products raw data:');
      allProducts.slice(0, 3).forEach((p: any) => {
        console.log(`- Name: ${p.name}, ID: ${p.id}, ExtID: ${p.external_id}`);
      });
    }

    // 2. Identify Tier 1 (Staples)
    let stapleProducts = allProducts.filter((p: any) => {
      const idStr = p.id?.toString() || "";
      const extId = p.external_id?.replace(/^#/, "") || "";
      return STAPLE_IDS.includes(idStr) || STAPLE_IDS.includes(extId);
    });

    // FAILSAFE: If staples are empty, grab the first 3 products from the catalog
    if (stapleProducts.length === 0 && allProducts.length > 0) {
      console.warn('FAILSAFE: No curated Staples found. Using first 3 catalog products.');
      stapleProducts = allProducts.slice(0, 3);
    }

    // 3. Identify Tier 2 (Seasonal - Summer Only)
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 3 && currentMonth <= 8;
    const seasonalProducts = isSummer ? allProducts.filter((p: any) => {
      const idStr = p.id?.toString() || "";
      const extId = p.external_id?.replace(/^#/, "") || "";
      return SEASONAL_SUMMER_IDS.includes(idStr) || SEASONAL_SUMMER_IDS.includes(extId);
    }) : [];

    // 4. Identify Tier 3 (Accessories / Sanctuary Gear)
    let accessoryProducts = allProducts.filter((p: any) => {
      const idStr = p.id?.toString() || "";
      const extId = p.external_id?.replace(/^#/, "") || "";
      return ACCESSORY_IDS.includes(idStr) || ACCESSORY_IDS.includes(extId);
    });

    // FAILSAFE: The 'Sanctuary Gear' section must NEVER be empty.
    if (accessoryProducts.length === 0 && allProducts.length > 3) {
      console.warn('FAILSAFE: No curated Accessories found. Using next 4 catalog products.');
      accessoryProducts = allProducts.slice(3, 7);
    }

    // 5. Hydrate all selected products with details (Price, Variants, Large Thumbnails)
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

        // Use high-res thumbnail from variants if p.thumbnail_url is generic
        const thumb = p.thumbnail_url || (variants[0]?.files?.find((f: any) => f.type === 'preview')?.thumbnail_url) || variants[0]?.files?.[0]?.thumbnail_url;

        return {
          id: p.id,
          name: p.name,
          thumbnailUrl: thumb,
          redirectUrl: syncProduct.external_url || `https://decent-ducks.printful.me/product/${p.id}`,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          description: syncProduct.description || 'Official Sanctuary Gear',
          tier
        };
      } catch (e) {
        return null;
      }
    };

    const hydratedStaples = await Promise.all(stapleProducts.map(p => hydrate(p, 1)));
    const hydratedSeasonal = await Promise.all(seasonalProducts.map(p => hydrate(p, 2)));
    const hydratedAccessories = await Promise.all(accessoryProducts.map(p => hydrate(p, 3)));

    const results = [
      ...hydratedStaples,
      ...hydratedSeasonal,
      ...hydratedAccessories
    ].filter(Boolean);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('STOREFRONT SYNC ERROR:', error);
    return NextResponse.json({ error: 'Failed to synchronize storefront' }, { status: 500 });
  }
}
