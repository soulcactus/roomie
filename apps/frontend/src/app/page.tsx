import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);

  redirect(hasAccessToken ? '/dashboard' : '/login');
}

