'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Aperture } from 'lucide-react';
import Link from 'next/link';

export default function LogoComponent({
  brandName,
  brandSlug
}: {
  brandName: string;
  brandSlug: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <Link
        href="/"
        aria-label={`${brandName} ${brandSlug} home`}
        className="group flex min-w-0 items-center gap-1.5 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
        <motion.span
          aria-hidden="true"
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.14, 1],
                  opacity: [0.72, 1, 0.72]
                }
          }
          transition={{
            duration: 2.4,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY
          }}
          className="grid size-6 shrink-0 place-items-center rounded-full border border-accent/25 bg-accent/10 text-accent shadow-sm sm:size-7">
          <Aperture className="size-3.5 sm:size-4" />
        </motion.span>

        <span className="flex min-w-0 items-baseline gap-1 whitespace-nowrap leading-none">
          <strong className="text-sm font-black tracking-tight text-secondary sm:text-base">
            {brandName}
          </strong>
          <span className="text-sm font-medium tracking-tight text-foreground sm:text-base">
            {brandSlug}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
