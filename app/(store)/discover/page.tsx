'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import DiscoverExperienceShell from '@/components/discovery-hub-panel/DiscoverExperienceShell';

export default function DiscoverPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    if (desktopQuery.matches) {
      router.replace('/store');
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-dvh bg-background px-3 pb-24 pt-3">
      <div className="mx-auto w-full max-w-3xl">
        <DiscoverExperienceShell />
      </div>
    </div>
  );
}
