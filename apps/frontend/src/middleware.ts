import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/');
  const isDashboardPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const isRootPage = pathname === '/';

  if (!accessToken && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isRootPage) {
    return NextResponse.redirect(
      new URL(accessToken ? '/dashboard' : '/login', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};

