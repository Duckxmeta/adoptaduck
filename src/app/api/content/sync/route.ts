import { NextResponse } from 'next/server';

// Feature removed for simplicity. Manual bulletin updates via the admin portal continue to work.
export async function POST() {
  return NextResponse.json({
    error: 'Sync endpoint disabled. Use the admin portal for sanctuary updates.',
    skipped: true
  }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ status: 'disabled' });
}
