
import { NextResponse } from 'next/server';

/**
 * @fileOverview Next.js API route to fetch products from Printful.
 * Provides the active product catalog for the sanctuary storefront.
 */

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Printful API Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data.result || []);
  } catch (error: any) {
    console.error('Error fetching Printful products:', error);
    return NextResponse.json({ error: 'Failed to fetch merch catalog' }, { status: 500 });
  }
}
