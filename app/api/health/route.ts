import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await sanityClient.fetch('count(*[_type == "siteSettings"])');

    return NextResponse.json({
      status: 'ok',
      app: 'helo-site',
      cms: 'reachable',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        app: 'helo-site',
        cms: 'unreachable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
