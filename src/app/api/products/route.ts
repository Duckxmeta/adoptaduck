
import { NextResponse } from 'next/server';

/**
 * @fileOverview API route to fetch live products from Printful.
 * Optimized to perform variant array scans for accurate price range calculation.
 */

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Printful API Key not configured' }, { status: 500 });
  }

  try {
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
    };

    // Fetch basic sync products
    const response = await fetch('https://api.printful.com/store/products', { headers });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.result || [];

    // Detailed scan for top 10 products to get variants and pricing
    const detailedProducts = await Promise.all(products.slice(0, 10).map(async (p: any) => {
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

        return {
          id: p.id,
          name: p.name,
          thumbnailUrl: p.thumbnail_url,
          // Map external ID or store URL for the Buy Now button
          redirectUrl: syncProduct.external_url || `https://decent-ducks.printful.me/product/${p.id}`,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          description: syncProduct.description || 'Official Sanctuary Gear'
        };
      } catch (error) {
        console.error(`Error scanning product ${p.id}:`, error);
        return null;
      }
    }));

    // Filter out failed scans
    const finalCatalog = detailedProducts.filter(Boolean);

    return NextResponse.json(finalCatalog);
  } catch (error: any) {
    console.error('Error fetching live merch catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch live catalog' }, { status: 500 });
  }
}
