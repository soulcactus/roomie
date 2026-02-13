import { cookies } from 'next/headers';

const BACKEND_BASE_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

export async function hasValidSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const serializedCookie = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');

  if (!serializedCookie) {
    return false;
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        cookie: serializedCookie,
        accept: 'application/json',
      },
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
}

