import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_BOSS_ROUTES = ['/boss/login'];
const AUTH_PATH_PREFIX = '/api/auth';
const ALLOWED_METHODS_WITHOUT_AUTH = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isBossRoute = pathname.startsWith('/boss');
  const isApiRoute = pathname.startsWith('/api');

  if (!isBossRoute && !isApiRoute) {
    return NextResponse.next();
  }

  const isPublicBossRoute = PUBLIC_BOSS_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isNextAuthRoute = pathname.startsWith(AUTH_PATH_PREFIX);

  if (isPublicBossRoute || isNextAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (isBossRoute) {
    if (!token) {
      const loginUrl = new URL('/boss/login', request.url);
      if (pathname !== '/boss') {
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isApiRoute) {
    const method = request.method.toUpperCase();
    const requiresAuth = !ALLOWED_METHODS_WITHOUT_AUTH.has(method);

    if (!requiresAuth) {
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/boss/:path*', '/api/:path*'],
};
