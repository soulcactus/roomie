import { redirect } from 'next/navigation';
import { hasSessionCookie } from '@/lib/auth/session-server';

export default async function HomePage() {
  const isAuthenticated = await hasSessionCookie();
  redirect(isAuthenticated ? '/dashboard' : '/login');
}
