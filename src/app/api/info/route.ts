import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Decent Ducks Virtual Sanctuary',
    creator: 'Kyle Kinkin',
    portfolio: 'https://www.justduckit.xyz/work',
    contactUrl: 'https://www.justduckit.xyz/work',
    status: 'online',
  });
}
