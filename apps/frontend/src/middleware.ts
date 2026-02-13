import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasSessionCookie = Boolean(accessToken || refreshToken);

  const isDashboardPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isRootPage = pathname === '/';

  if (!hasSessionCookie && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isRootPage) {
    return NextResponse.redirect(
      new URL(hasSessionCookie ? '/dashboard' : '/login', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};
