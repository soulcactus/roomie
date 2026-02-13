import { cookies } from 'next/headers';

export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  return Boolean(accessToken || refreshToken);
}
