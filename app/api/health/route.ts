import { NextResponse } from 'next/server';
import { sanityClient } from '@/sanity/lib/client';

export const dynamic = 'force-dynamic';

function basePayload() {
  return {
    app: 'helo-site',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    await sanityClient.fetch('count(*[_type == "siteSettings"])');

    return NextResponse.json({
      status: 'ok',
      cms: 'reachable',
      ...basePayload(),
    });
  } catch {
    return NextResponse.json(
      {
        status: 'degraded',
        cms: 'unreachable',
        ...basePayload(),
      },
      { status: 503 },
    );
  }
}
