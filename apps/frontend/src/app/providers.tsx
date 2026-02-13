'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isMswReady, setIsMswReady] = useState(
    process.env.NODE_ENV !== 'development',
  );
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let cancelled = false;

    const startWorker = async () => {
      const { worker } = await import('@/mocks/browser');

      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });

      if (!cancelled) {
        setIsMswReady(true);
      }
    };

    startWorker().catch(() => {
      if (!cancelled) {
        setIsMswReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isMswReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
