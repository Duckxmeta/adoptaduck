import { NextResponse } from 'next/server';

/**
 * @fileOverview Curated Merch API Controller.
 * Synchronizes specific Printful IDs into Tiered Categories.
 * Tier 1: Staples (Always ON)
 * Tier 2: Seasonal (Summer: April-Sept)
 * Tier 3: Accessories (Footer Row)
 */

const STAPLE_IDS = ['68a540b74ab376', '69cbfd8a5d8938', '69cc0bf0eb8546'];
const SEASONAL_SUMMER_IDS = ['69d140ea45fe28', '69d13cef0d5c46', '69d13d58b1b314'];
const ACCESSORY_IDS = ['69cc02a0a31cc9', '69cc0475957615', '69cc004ee58d81', '69cc05e38a0234'];

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Sanctuary store mirror not configured' }, { status: 500 });
  }

  try {
    const headers = { 'Authorization': `Bearer ${apiKey}` };
    
    // Fetch all sync products
    const response = await fetch('https://api.printful.com/store/products', { headers });
    if (!response.ok) throw new Error(`Printful Error: ${response.statusText}`);

    const data = await response.json();
    const allProducts = data.result || [];

    // Seasonal Logic: Summer = April (3) to September (8)
    const currentMonth = new Date().getMonth();
    const isSummer = currentMonth >= 3 && currentMonth <= 8;

    const curatedIds = [
      ...STAPLE_IDS,
      ...(isSummer ? SEASONAL_SUMMER_IDS : []),
      ...ACCESSORY_IDS
    ];

    const finalProducts = await Promise.all(
      allProducts
        .filter((p: any) => {
          const idStr = p.id?.toString() || "";
          const extId = p.external_id?.replace(/^#/, "") || "";
          return curatedIds.includes(idStr) || curatedIds.includes(extId);
        })
        .map(async (p: any) => {
          const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, { headers });
          if (!detailRes.ok) return null;

          const detailData = await detailRes.json();
          const syncProduct = detailData.result?.sync_product || {};
          const variants = detailData.result?.sync_variants || [];
          
          const prices = variants
            .map((v: any) => parseFloat(v.retail_price))
            .filter((price: number) => !isNaN(price));

          if (prices.length === 0) return null;

          // Categorization Logic
          const idStr = p.id?.toString() || "";
          const extId = p.external_id?.replace(/^#/, "") || "";
          
          let tier = 3;
          if (STAPLE_IDS.includes(idStr) || STAPLE_IDS.includes(extId)) tier = 1;
          else if (SEASONAL_SUMMER_IDS.includes(idStr) || SEASONAL_SUMMER_IDS.includes(extId)) tier = 2;

          return {
            id: p.id,
            name: p.name,
            thumbnailUrl: p.thumbnail_url || (variants[0]?.files?.find((f: any) => f.type === 'preview')?.thumbnail_url),
            redirectUrl: syncProduct.external_url || `https://decent-ducks.printful.me/product/${p.id}`,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            description: syncProduct.description || 'Official Sanctuary Gear',
            tier
          };
        })
    );

    return NextResponse.json(finalProducts.filter(Boolean));
  } catch (error: any) {
    console.error('Merch Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync curated inventory' }, { status: 500 });
  }
}
