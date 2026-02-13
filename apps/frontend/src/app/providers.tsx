'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const shouldEnableMsw =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
  const [isMswReady, setIsMswReady] = useState(!shouldEnableMsw);
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
    if (!shouldEnableMsw) return;

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
  }, [shouldEnableMsw]);

  if (!isMswReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
