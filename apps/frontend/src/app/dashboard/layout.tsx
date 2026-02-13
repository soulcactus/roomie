import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get('access_token')?.value);

  if (!hasAccessToken) {
    redirect('/login');
  }

  return <>{children}</>;
}

