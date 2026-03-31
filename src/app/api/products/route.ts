
import { NextResponse } from 'next/server';

/**
 * @fileOverview Next.js API route to fetch products from Printful.
 * Provides the active product catalog for the sanctuary storefront,
 * calculating price ranges across all variants.
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

    const response = await fetch('https://api.printful.com/store/products', { headers });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.result || [];

    // Fetch details for each product to get variant pricing
    // We limit to the first 12 products to ensure responsive loading
    const detailedProducts = await Promise.all(products.slice(0, 12).map(async (p: any) => {
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, { headers });
        if (!detailRes.ok) return p;

        const detailData = await detailRes.json();
        const variants = detailData.result?.sync_variants || [];
        
        const prices = variants
          .map((v: any) => parseFloat(v.retail_price))
          .filter((price: number) => !isNaN(price));

        if (prices.length === 0) return { ...p, minPrice: 0, maxPrice: 0 };

        return {
          ...p,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices)
        };
      } catch (error) {
        console.error(`Error fetching details for product ${p.id}:`, error);
        return p;
      }
    }));

    return NextResponse.json(detailedProducts);
  } catch (error: any) {
    console.error('Error fetching Printful products:', error);
    return NextResponse.json({ error: 'Failed to fetch merch catalog' }, { status: 500 });
  }
}
