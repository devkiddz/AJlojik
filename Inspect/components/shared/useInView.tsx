'use client';

import { useEffect, useState } from 'react';

export function useInView(ref: React.RefObject<HTMLElement>) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
