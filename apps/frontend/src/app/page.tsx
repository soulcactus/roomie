import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/auth/session-server';

export default async function HomePage() {
  const isAuthenticated = await hasValidSession();
  redirect(isAuthenticated ? '/dashboard' : '/login');
}
