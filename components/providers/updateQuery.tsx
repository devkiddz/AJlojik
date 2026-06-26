import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();

const updateQuery = useCallback(
  (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false
    });
  },
  [router, pathname, searchParams]
);
