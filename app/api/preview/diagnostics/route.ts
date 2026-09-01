import {NextResponse} from 'next/server';
import {createClient} from 'next-sanity';

export const dynamic = 'force-dynamic';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'f9ampmu2';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helo-sable-five.vercel.app';
const apiVersion = '2026-09-01';

export async function GET() {
  const token = process.env.SANITY_API_READ_TOKEN;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  const publicClient = createClient({projectId, dataset, apiVersion, useCdn: false});
  const authenticatedClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });

  let publicQuery = false;
  let publicError: string | null = null;
  let authenticatedQuery = false;
  let authenticatedError: string | null = null;

  try {
    await publicClient.fetch('count(*)');
    publicQuery = true;
  } catch (error) {
    publicError = error instanceof Error ? error.message : 'Unknown public query error';
  }

  if (token) {
    try {
      await authenticatedClient.fetch('count(*)');
      authenticatedQuery = true;
    } catch (error) {
      authenticatedError = error instanceof Error ? error.message : 'Unknown authenticated query error';
    }
  } else {
    authenticatedError = 'SANITY_API_READ_TOKEN is not configured in this deployment.';
  }

  const tokenConfigured = Boolean(token);
  const writeTokenConfigured = Boolean(writeToken);
  const ok = publicQuery && tokenConfigured && authenticatedQuery;

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      projectId,
      dataset,
      siteUrl,
      checks: {
        publicQuery: {ok: publicQuery, error: publicError},
        tokenConfigured: {ok: tokenConfigured},
        authenticatedQuery: {ok: authenticatedQuery, error: authenticatedError},
        writeTokenConfigured: {ok: writeTokenConfigured},
      },
      deployment: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {'Cache-Control': 'no-store, max-age=0'},
    },
  );
}
