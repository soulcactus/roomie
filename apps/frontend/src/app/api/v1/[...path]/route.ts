import { NextRequest, NextResponse } from 'next/server';

function getRequiredBackendBaseUrl() {
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicApiUrl) {
    return publicApiUrl;
  }

  throw new Error('NEXT_PUBLIC_API_URL 환경변수가 필요합니다.');
}

const BACKEND_BASE_URL = getRequiredBackendBaseUrl();

function buildTargetUrl(path: string[], search: string) {
  const normalizedBase = BACKEND_BASE_URL.replace(/\/$/, '');
  const targetPath = path.join('/');
  return `${normalizedBase}/api/v1/${targetPath}${search}`;
}

function copySetCookieHeaders(source: Headers, target: Headers) {
  const headersWithGetSetCookie = source as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === 'function') {
    const cookies = headersWithGetSetCookie.getSetCookie();
    for (const cookie of cookies) {
      target.append('set-cookie', cookie);
    }
    return;
  }

  const setCookie = source.get('set-cookie');
  if (setCookie) {
    // 일부 런타임에서 여러 Set-Cookie가 단일 문자열로 합쳐질 수 있어 분리 처리
    const splitCookies = setCookie.split(/,(?=[^;,\s]+=)/g);
    for (const cookie of splitCookies) {
      target.append('set-cookie', cookie.trim());
    }
  }
}

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = buildTargetUrl(path, request.nextUrl.search);

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');
  const authorization = request.headers.get('authorization');
  const cookie = request.headers.get('cookie');

  if (contentType) headers.set('content-type', contentType);
  if (accept) headers.set('accept', accept);
  if (authorization) headers.set('authorization', authorization);
  if (cookie) headers.set('cookie', cookie);

  const bodyText =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.text();

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: bodyText && bodyText.length > 0 ? bodyText : undefined,
    redirect: 'manual',
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  const responseContentType = backendResponse.headers.get('content-type');
  if (responseContentType) {
    responseHeaders.set('content-type', responseContentType);
  }

  copySetCookieHeaders(backendResponse.headers, responseHeaders);

  if (backendResponse.status === 204) {
    return new NextResponse(null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  }

  const responseBody = await backendResponse.arrayBuffer();
  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

type RouteContext = {
  params: {
    path: string[];
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxy(request, context.params.path);
}
