import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const PRIMARY_HOST = 'draheloisaveiga.com.br';
const LEGACY_HOSTS = new Set([
  'www.draheloisaveiga.com.br',
  'draheloisaveiga.vercel.app',
  'helo-sable-five.vercel.app',
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase();

  if (host && LEGACY_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = PRIMARY_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
